import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const adminRoles = new Set(["ADMIN", "PROJECT_ADMIN", "ROLE_ADMIN", "ROLE_PROJECT_ADMIN"]);
const isDate = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return withSupabase({ auth: "user" }, async (_request, ctx) => {
    try {
      if (req.method !== "POST") return Response.json({ error: { message: "POST required" } }, { status: 405, headers: corsHeaders });
      const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
      const { data: authData, error: authError } = bearer
        ? await ctx.supabaseAdmin.auth.getUser(bearer)
        : { data: { user: null }, error: new Error("Missing bearer token") };
      const userId = authError ? null : authData.user?.id;
      if (!userId) return Response.json({ error: { message: "Authentication required" } }, { status: 401, headers: corsHeaders });

      const body = await req.json().catch(() => ({}));
      if ((body.from && !isDate(body.from)) || (body.to && !isDate(body.to))) {
        return Response.json({ error: { message: "Dates must use YYYY-MM-DD" } }, { status: 400, headers: corsHeaders });
      }
      const admin = ctx.supabaseAdmin;
      const { data: profile, error: profileError } = await admin.from("profiles").select("role").eq("id", userId).single();
      if (profileError || !adminRoles.has(profile?.role)) {
        return Response.json({ error: { message: "Admin role is required" } }, { status: 403, headers: corsHeaders });
      }
      const { data, error } = await admin.rpc("get_legacy_activity_report", { p_from: body.from || null, p_to: body.to || null });
      if (error) throw error;
      const rows = data || [];
      const summary = rows.reduce((total, row) => ({
        participants: total.participants + 1,
        attendance: total.attendance + Number(row.attendance_count || 0),
        education: total.education + Number(row.education_completions || 0),
        activities: total.activities + Number(row.activity_count || 0),
      }), { participants: 0, attendance: 0, education: 0, activities: 0 });
      return Response.json({ rows, summary }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (error) {
      console.error("legacy-activity-report failed", error instanceof Error ? error.message : "unknown");
      return Response.json({ error: { message: "Legacy activity report failed" } }, { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  })(req);
});
