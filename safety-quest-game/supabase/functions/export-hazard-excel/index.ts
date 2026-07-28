import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const managerRoles = new Set(["SUPERVISOR", "SAFETY_MANAGER", "ADMIN", "PROJECT_ADMIN"]);

const clean = (value: unknown) => String(value ?? "").replace(/[\u0000-\u001f]/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return withSupabase({ auth: "user" }, async (_request, ctx) => {
    try {
      if (req.method !== "POST") return Response.json({ error: { message: "POST required" } }, { status: 405, headers: corsHeaders });
      const userId = ctx.userClaims?.sub;
      if (!userId) return Response.json({ error: { message: "Authentication required" } }, { status: 401, headers: corsHeaders });
      const body = await req.json().catch(() => ({}));
      const from = typeof body.from === "string" ? body.from.slice(0, 10) : null;
      const to = typeof body.to === "string" ? body.to.slice(0, 10) : null;
      if ((from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) || (to && !/^\d{4}-\d{2}-\d{2}$/.test(to))) {
        return Response.json({ error: { message: "Dates must use YYYY-MM-DD" } }, { status: 400, headers: corsHeaders });
      }

      const admin = ctx.supabaseAdmin;
      const { data: profile, error: profileError } = await admin.from("profiles").select("role").eq("id", userId).single();
      if (profileError || !managerRoles.has(profile?.role)) {
        return Response.json({ error: { message: "Manager role is required" } }, { status: 403, headers: corsHeaders });
      }

      let query = admin.from("hazard_cycles")
        .select("id,status,hazard_description,location_description,reported_at,completed_at,completion_note,ai_analysis,reporter_id")
        .order("reported_at", { ascending: false })
        .limit(5000);
      if (from) query = query.gte("reported_at", `${from}T00:00:00.000Z`);
      if (to) query = query.lt("reported_at", `${to}T23:59:59.999Z`);
      const { data: cycles, error: cyclesError } = await query;
      if (cyclesError) throw cyclesError;

      const reporterIds = [...new Set((cycles || []).map((row) => row.reporter_id))];
      const { data: reporters, error: reportersError } = reporterIds.length
        ? await admin.from("profiles").select("id,name,username").in("id", reporterIds)
        : { data: [], error: null };
      if (reportersError) throw reportersError;
      const names = new Map((reporters || []).map((row) => [row.id, clean(row.name) || clean(row.username) || "User"]));

      const rows = (cycles || []).map((cycle) => {
        const analysis = cycle.ai_analysis || {};
        return {
          "Report ID": cycle.id,
          "Reported at": cycle.reported_at,
          "Reporter": names.get(cycle.reporter_id) || "User",
          "Status": cycle.status,
          "Location": clean(cycle.location_description),
          "Hazard description": clean(cycle.hazard_description),
          "Risk level": clean(analysis.riskLevel),
          "Risk score": clean(analysis.riskScore),
          "Risk factor": clean(analysis.riskFactor),
          "Completion note": clean(cycle.completion_note),
          "Completed at": cycle.completed_at || "",
        };
      });
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ "Report ID": "No matching reports" }]);
      sheet["!cols"] = [18, 22, 20, 18, 30, 48, 14, 12, 42, 42, 22].map((wch) => ({ wch }));
      XLSX.utils.book_append_sheet(workbook, sheet, "Hazard reports");
      const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const path = `${userId}/hazard-exports/hazard-reports-${stamp}.xlsx`;
      const { error: uploadError } = await admin.storage.from("generated-docs").upload(path, bytes, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data: signed, error: signedError } = await admin.storage.from("generated-docs").createSignedUrl(path, 300);
      if (signedError) throw signedError;
      return Response.json({ signedUrl: signed.signedUrl, expiresIn: 300, reportCount: rows.length }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (error) {
      console.error("export-hazard-excel failed", error instanceof Error ? error.message : "unknown");
      return Response.json({ error: { message: "Excel export failed" } }, { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  })(req);
});
