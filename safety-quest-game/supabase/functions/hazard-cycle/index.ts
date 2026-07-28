import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const TIER1_POINTS = 100;
const TIER2_POINTS = 100;

function response(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } }); }
function toBase64(bytes: Uint8Array) { let value = ""; for (let i = 0; i < bytes.length; i += 0x8000) value += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(value); }
function safeName(name: string) { return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "photo.jpg"; }

async function analyze(file: File, description: string, location: string) {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("AI service is not configured");
  const prompt = `대한민국 산업안전보건 현장의 사진과 설명을 분석하세요. JSON 객체만 반환하세요. 필수 키: riskFactor(string), remediationSteps(string[]), referenceCode(string|null), riskLevel(LOW|MEDIUM|HIGH|CRITICAL), hazardClassification(string), unsafeCondition(string), unsafeAct(string), possibleAccident(string), severity({score:1~5,rationale:string}), likelihood({score:1~5,rationale:string}), legalBasis(array), koshaGuide(string|null), controlMeasures({immediate:string[],engineering:string[],administrative:string[],ppe:string[]}), responsibleRole(string), dueDays(integer), confidence(number 0~1). 설명: ${description || "없음"}. 위치: ${location || "없음"}.`;
  const api = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type, data: toBase64(new Uint8Array(await file.arrayBuffer())) } }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: "application/json" } }) });
  if (!api.ok) throw new Error("Gemini analysis failed");
  const payload = await api.json();
  const text = payload?.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => part.text)?.text;
  if (!text) throw new Error("Gemini returned no analysis");
  const result = JSON.parse(text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, ""));
  const severity = Number(result?.severity?.score), likelihood = Number(result?.likelihood?.score);
  return { ...result, riskScore: Number.isInteger(severity) && Number.isInteger(likelihood) ? severity * likelihood : null };
}

async function mapCycle(admin: any, cycle: any) {
  const [hazard, completion] = await Promise.all([
    admin.storage.from("safety-road-photos").createSignedUrl(cycle.hazard_photo_path, 3600),
    cycle.completion_photo_path ? admin.storage.from("safety-road-photos").createSignedUrl(cycle.completion_photo_path, 3600) : Promise.resolve({ data: null }),
  ]);
  return { id: cycle.id, status: cycle.status, hazardDescription: cycle.hazard_description, locationDescription: cycle.location_description, reportedAt: cycle.reported_at, hazardPhotoUrl: hazard.data?.signedUrl ?? null, completionPhotoUrl: completion.data?.signedUrl ?? null, completionNote: cycle.completion_note, completedAt: cycle.completed_at, aiAnalysis: cycle.ai_analysis, tier1Reward: { pointsAwarded: cycle.tier1_points_awarded }, tier2Reward: { pointsAwarded: cycle.tier2_points_awarded }, totalPointsEarned: cycle.tier1_points_awarded + cycle.tier2_points_awarded };
}

async function award(admin: any, userId: string, points: number, reason: string, description: string) {
  const { data: balanceRow, error: readError } = await admin.from("user_points").select("balance,total_earned").eq("user_id", userId).single();
  if (readError) throw readError;
  const balance = Number(balanceRow.balance) + points;
  const { error: updateError } = await admin.from("user_points").update({ balance, total_earned: Number(balanceRow.total_earned || 0) + points, updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (updateError) throw updateError;
  const { error: ledgerError } = await admin.from("point_transactions").insert({ user_id: userId, amount: points, transaction_type: "EARN", reason, description, balance_after: balance });
  if (ledgerError) throw ledgerError;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return withSupabase({ auth: "user" }, async (_request, ctx) => {
    if (req.method !== "POST") return response({ error: { message: "POST 요청만 허용됩니다." } }, 405);
    try {
      const userId = ctx.userClaims?.sub;
      if (!userId) return response({ error: { message: "로그인이 필요합니다." } }, 401);
      const admin = ctx.supabaseAdmin;
      const form = await req.formData();
      const action = String(form.get("action") ?? "create");
      if (action === "create") {
        const photo = form.get("photo");
        if (!(photo instanceof File) || !photo.type.startsWith("image/") || photo.size > MAX_IMAGE_BYTES) return response({ error: { message: "10MB 이하 이미지 사진이 필요합니다." } }, 400);
        const description = String(form.get("description") ?? "").slice(0, 2000), location = String(form.get("location") ?? "").slice(0, 500), clientTempId = String(form.get("clientTempId") ?? "").slice(0, 100) || null;
        if (clientTempId) { const { data } = await admin.from("hazard_cycles").select("*").eq("reporter_id", userId).eq("client_temp_id", clientTempId).maybeSingle(); if (data) return response(await mapCycle(admin, data)); }
        const analysis = await analyze(photo, description, location);
        const id = crypto.randomUUID(), path = `${userId}/hazard/${id}-${safeName(photo.name)}`;
        const { error: uploadError } = await admin.storage.from("safety-road-photos").upload(path, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;
        const now = new Date().toISOString();
        const { data: cycle, error: insertError } = await admin.from("hazard_cycles").insert({ id, reporter_id: userId, hazard_photo_path: path, hazard_description: description || null, location_description: location || null, ai_analysis: analysis, ai_analyzed_at: now, status: "AI_ANALYZED", tier1_points_awarded: TIER1_POINTS, tier1_awarded_at: now, client_temp_id: clientTempId }).select().single();
        if (insertError) { await admin.storage.from("safety-road-photos").remove([path]); throw insertError; }
        await award(admin, userId, TIER1_POINTS, "HAZARD_CYCLE_TIER1", "Hazard discovery and AI analysis");
        return response(await mapCycle(admin, cycle));
      }
      if (action === "list") {
        const status = String(form.get("status") ?? "ALL"), page = Math.max(0, Number(form.get("page") ?? 0) || 0), size = Math.min(50, Math.max(1, Number(form.get("size") ?? 20) || 20));
        let query = admin.from("hazard_cycles").select("*", { count: "exact" }).eq("reporter_id", userId).order("reported_at", { ascending: false });
        if (status !== "ALL") query = query.eq("status", status);
        const { data, count, error } = await query.range(page * size, page * size + size - 1);
        if (error) throw error;
        return response({ content: await Promise.all((data ?? []).map((cycle: any) => mapCycle(admin, cycle))), totalElements: count ?? 0, totalPages: Math.ceil((count ?? 0) / size), number: page, size });
      }
      if (action === "detail" || action === "summary") {
        const cycleId = String(form.get("cycleId") ?? ""); let query = admin.from("hazard_cycles").select("*").eq("id", cycleId); if (action === "detail") query = query.eq("reporter_id", userId);
        const { data, error } = await query.single(); if (error || !data) return response({ error: { message: "Cycle not found" } }, 404); return response(await mapCycle(admin, data));
      }
      if (action === "ack") {
        const cycleId = String(form.get("cycleId") ?? ""), comment = String(form.get("comment") ?? "").slice(0, 500) || null;
        const { data: cycle, error: cycleError } = await admin.from("hazard_cycles").select("reporter_id").eq("id", cycleId).single();
        if (cycleError || !cycle) return response({ error: { message: "Cycle not found" } }, 404);
        if (cycle.reporter_id === userId) return response({ error: { code: "HC006", message: "You cannot acknowledge your own cycle." } }, 409);
        const { data, error } = await admin.from("hazard_cycle_acks").insert({ cycle_id: cycleId, user_id: userId, comment }).select().single();
        if (error?.code === "23505") return response({ error: { code: "HC005", message: "Already acknowledged." } }, 409); if (error) throw error;
        return response({ id: data.id, cycleId: data.cycle_id, comment: data.comment, ackedAt: data.created_at });
      }
      if (action === "acks") {
        const cycleId = String(form.get("cycleId") ?? ""); const { data, error } = await admin.from("hazard_cycle_acks").select("id,user_id,comment,created_at").eq("cycle_id", cycleId).order("created_at", { ascending: true }); if (error) throw error;
        const ids = (data ?? []).map((ack: any) => ack.user_id); const { data: profiles } = ids.length ? await admin.from("profiles").select("id,name,username").in("id", ids) : { data: [] }; const names = new Map((profiles ?? []).map((profile: any) => [profile.id, profile.name || profile.username || "User"]));
        return response((data ?? []).map((ack: any) => ({ id: ack.id, comment: ack.comment, ackerName: names.get(ack.user_id) || "User", ackedAt: ack.created_at })));
      }
      if (action === "stats") { const { data, error } = await admin.from("hazard_cycles").select("status").eq("reporter_id", userId); if (error) throw error; const cycles = data ?? []; const byStatus = Object.fromEntries(["HAZARD_REPORTED", "AI_ANALYZED", "ACTION_COMPLETED", "EXPIRED", "REJECTED"].map((key) => [key, cycles.filter((cycle: any) => cycle.status === key).length])); return response({ total: cycles.length, completed: byStatus.ACTION_COMPLETED, byStatus }); }
      if (action === "complete") {
        const cycleId = String(form.get("cycleId") ?? ""), photo = form.get("photo"), note = String(form.get("note") ?? "").slice(0, 2000);
        if (!(photo instanceof File) || !photo.type.startsWith("image/") || photo.size > MAX_IMAGE_BYTES) return response({ error: { message: "10MB 이하 이미지 사진이 필요합니다." } }, 400);
        const { data: existing, error: findError } = await admin.from("hazard_cycles").select("*").eq("id", cycleId).eq("reporter_id", userId).single();
        if (findError || !existing) return response({ error: { message: "위험 사이클을 찾을 수 없습니다." } }, 404);
        if (existing.status === "ACTION_COMPLETED") return response(await mapCycle(admin, existing));
        const path = `${userId}/completion/${cycleId}-${safeName(photo.name)}`;
        const { error: uploadError } = await admin.storage.from("safety-road-photos").upload(path, photo, { contentType: photo.type, upsert: false }); if (uploadError) throw uploadError;
        const now = new Date().toISOString();
        const { data: cycle, error: updateError } = await admin.from("hazard_cycles").update({ completion_photo_path: path, completion_note: note || null, completed_at: now, status: "ACTION_COMPLETED", tier2_points_awarded: TIER2_POINTS, tier2_awarded_at: now }).eq("id", cycleId).select().single();
        if (updateError) { await admin.storage.from("safety-road-photos").remove([path]); throw updateError; }
        await award(admin, userId, TIER2_POINTS, "HAZARD_CYCLE_TIER2", "Hazard remediation completed");
        return response(await mapCycle(admin, cycle));
      }
      return response({ error: { message: "지원하지 않는 작업입니다." } }, 400);
    } catch (error) { console.error("hazard-cycle failed", error instanceof Error ? error.message : "unknown"); return response({ error: { message: "위험 사이클 처리에 실패했습니다." } }, 500); }
  })(req);
});
