import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const normalize = (value: unknown) => String(value ?? "").trim().toUpperCase();

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "GET" && req.method !== "POST") {
      return Response.json({ error: { message: "GET or POST required" } }, { status: 405, headers: corsHeaders });
    }

    let certificateNumber = new URL(req.url).searchParams.get("certificateNumber");
    if (req.method === "POST") {
      try {
        certificateNumber = certificateNumber || (await req.json()).certificateNumber;
      } catch {
        return Response.json({ error: { message: "Invalid JSON body" } }, { status: 400, headers: corsHeaders });
      }
    }
    certificateNumber = normalize(certificateNumber);
    if (!/^SQ-RISK-[0-9]{8}-[A-Z0-9]{10}$/.test(certificateNumber)) {
      return Response.json({ valid: false, error: { message: "Invalid certificate number" } }, { status: 400, headers: corsHeaders });
    }

    const { data, error } = await ctx.supabaseAdmin
      .from("hazard_certificates")
      .select("certificate_number,created_at,hazard_cycles!inner(status,reported_at,location_description)")
      .eq("certificate_number", certificateNumber)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return Response.json({ valid: false, certificateNumber }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const cycle = Array.isArray(data.hazard_cycles) ? data.hazard_cycles[0] : data.hazard_cycles;
    return Response.json({
      valid: true,
      certificateNumber: data.certificate_number,
      issuedAt: data.created_at,
      hazard: {
        status: cycle?.status ?? null,
        reportedAt: cycle?.reported_at ?? null,
        location: cycle?.location_description ?? null,
      },
    }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }),
};
