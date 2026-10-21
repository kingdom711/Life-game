import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { resolveUserId } from "../_shared/auth.ts";

// Administrator-approved password resets.
//
// `request` is called by a signed-out visitor, so gateway JWT verification is
// off for this function (see config.toml) and the body gates itself: the
// requested password is encrypted before it is stored, and only an
// administrator's own access token can approve or reject a request.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const adminRoles = new Set(["ADMIN", "PROJECT_ADMIN", "ROLE_ADMIN", "ROLE_PROJECT_ADMIN"]);
const supersededReason = "새 비밀번호 변경 요청으로 이전 요청이 취소되었습니다.";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// deno-lint-ignore no-explicit-any
type AdminClient = any;

const fail = (message: string, status: number) =>
  Response.json({ error: { message } }, { status, headers: jsonHeaders });
const ok = (payload: Record<string, unknown>) => Response.json(payload, { headers: jsonHeaders });

// AES-GCM with a key derived from the function secret. The stored value is the
// random 12-byte nonce followed by the sealed password, base64 encoded.
const encryptionKey = async () => {
  const secret = Deno.env.get("PASSWORD_RESET_ENCRYPTION_KEY");
  if (!secret || secret.length < 16) {
    throw new Error("PASSWORD_RESET_ENCRYPTION_KEY is not configured");
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
};

const toBase64 = (bytes: Uint8Array) => btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

const encryptPassword = async (password: string) => {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const sealed = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    await encryptionKey(),
    new TextEncoder().encode(password),
  ));
  const payload = new Uint8Array(nonce.length + sealed.length);
  payload.set(nonce);
  payload.set(sealed, nonce.length);
  return "v1." + toBase64(payload);
};

const decryptPassword = async (stored: string | null) => {
  if (!stored || !stored.startsWith("v1.")) throw new Error("Stored password has an unknown format");
  const payload = fromBase64(stored.slice(3));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: payload.slice(0, 12) },
    await encryptionKey(),
    payload.slice(12),
  );
  return new TextDecoder().decode(plain);
};

// Resolves the caller and confirms they hold an administrator role.
const requireAdmin = async (
  req: Request,
  ctx: { supabaseAdmin: AdminClient },
): Promise<{ adminId?: string; error?: Response }> => {
  const userId = await resolveUserId(req, ctx);
  if (!userId) return { error: fail("로그인이 필요합니다.", 401) };

  const { data: profile, error } = await ctx.supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (error || !adminRoles.has(String(profile?.role ?? ""))) {
    return { error: fail("관리자 권한이 필요합니다.", 403) };
  }
  return { adminId: userId };
};

const handleRequest = async (admin: AdminClient, body: Record<string, unknown>) => {
  const identity = String(body.email ?? "").trim();
  const newPassword = String(body.newPassword ?? "");

  if (identity.length < 3 || identity.length > 320) return fail("가입 이메일을 입력해주세요.", 400);
  if (identity.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity)) {
    return fail("이메일 형식이 올바르지 않습니다.", 400);
  }
  // 72 bytes is bcrypt's limit, which Supabase Auth applies to the password.
  if (newPassword.length < 6 || newPassword.length > 72) {
    return fail("비밀번호는 6자 이상 72자 이하여야 합니다.", 400);
  }

  const { data: targetId, error: lookupError } = await admin.rpc("find_password_reset_target", {
    p_identity: identity,
  });
  if (lookupError) throw lookupError;
  if (!targetId) return fail("해당 이메일로 가입된 계정을 찾을 수 없습니다.", 404);

  // Encrypt before touching any stored state: if the key is missing or the
  // password cannot be sealed, the account keeps the request it already had.
  const sealed = await encryptPassword(newPassword);

  // A new request supersedes whatever was still pending for this account.
  const { error: supersedeError } = await admin
    .from("password_reset_requests")
    .update({
      status: "REJECTED",
      reject_reason: supersededReason,
      processed_at: new Date().toISOString(),
      encrypted_new_password: null,
    })
    .eq("user_id", targetId)
    .eq("status", "PENDING");
  if (supersedeError) throw supersedeError;

  const { data: created, error: insertError } = await admin
    .from("password_reset_requests")
    .insert({
      user_id: targetId,
      requested_email: identity,
      encrypted_new_password: sealed,
    })
    .select("id, created_at")
    .single();
  if (insertError) throw insertError;

  return ok({ id: created.id, status: "PENDING", createdAt: created.created_at });
};

const handleApprove = async (admin: AdminClient, adminId: string, requestId: string) => {
  // Claiming the row first keeps two administrators from approving it twice.
  const { data: claimed, error: claimError } = await admin
    .from("password_reset_requests")
    .update({ status: "APPROVED", processed_by: adminId, processed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "PENDING")
    .select("id, user_id, encrypted_new_password")
    .maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) return fail("이미 처리되었거나 존재하지 않는 요청입니다.", 409);

  try {
    const password = await decryptPassword(claimed.encrypted_new_password);
    const { error: updateUserError } = await admin.auth.admin.updateUserById(claimed.user_id, { password });
    if (updateUserError) throw updateUserError;
  } catch (error) {
    // Hand the request back to the queue so the administrator can retry.
    await admin
      .from("password_reset_requests")
      .update({ status: "PENDING", processed_by: null, processed_at: null })
      .eq("id", requestId);
    throw error;
  }

  const { error: clearError } = await admin
    .from("password_reset_requests")
    .update({ encrypted_new_password: null })
    .eq("id", requestId);
  if (clearError) throw clearError;

  return ok({ id: claimed.id, status: "APPROVED" });
};

const handleReject = async (admin: AdminClient, adminId: string, requestId: string, reason: string) => {
  const trimmed = reason.trim();
  if (trimmed.length < 1 || trimmed.length > 255) return fail("반려 사유는 255자 이하로 입력해주세요.", 400);

  const { data: rejected, error } = await admin
    .from("password_reset_requests")
    .update({
      status: "REJECTED",
      reject_reason: trimmed,
      processed_by: adminId,
      processed_at: new Date().toISOString(),
      encrypted_new_password: null,
    })
    .eq("id", requestId)
    .eq("status", "PENDING")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!rejected) return fail("이미 처리되었거나 존재하지 않는 요청입니다.", 409);

  return ok({ id: rejected.id, status: "REJECTED" });
};

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req: Request, ctx: { supabaseAdmin: AdminClient }) => {
      if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
      if (req.method !== "POST") return fail("POST required", 405);

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return fail("Invalid JSON body", 400);
      }

      const action = String(body.action ?? "");
      const admin = ctx.supabaseAdmin;

      try {
        if (action === "request") return await handleRequest(admin, body);

        if (action === "approve" || action === "reject") {
          const requestId = String(body.id ?? "");
          if (!uuidPattern.test(requestId)) return fail("요청 ID가 올바르지 않습니다.", 400);

          const { adminId, error } = await requireAdmin(req, ctx);
          if (error || !adminId) return error ?? fail("관리자 권한이 필요합니다.", 403);

          return action === "approve"
            ? await handleApprove(admin, adminId, requestId)
            : await handleReject(admin, adminId, requestId, String(body.reason ?? ""));
        }

        return fail("Unsupported action", 400);
      } catch (error) {
        console.error("password-reset-approval failed", action, error instanceof Error ? error.message : "unknown");
        return fail("비밀번호 변경 요청 처리에 실패했습니다.", 500);
      }
    },
  ),
};
