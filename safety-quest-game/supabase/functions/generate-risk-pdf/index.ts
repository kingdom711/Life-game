import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit@1.1.1";
import QRCode from "npm:qrcode@1.5.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const safeText = (value: unknown, fallback = "-") => {
  // Keep Korean and other Unicode text intact. The embedded Noto Sans KR font
  // below is deliberately used for every user-provided field.
  const text = String(value ?? fallback).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  return text || fallback;
};

const wrap = (text: string, width = 82) => {
  const words = text.split(/\s+/); const lines: string[] = []; let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > width && line) { lines.push(line); line = word; }
    else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines;
};

async function createPdf(cycle: any, certificateNumber: string) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fontBytes = await Deno.readFile(new URL("./NotoSansKR-Regular.ttf", import.meta.url));
  // This is already a compact static NotoSansKR subset. Letting pdf-lib
  // subset it again corrupts Hangul glyph advance widths in rendered PDFs.
  const regular = await pdf.embedFont(fontBytes, { subset: false });
  const bold = regular;
  let page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  let y = height - 56;
  const nextPage = () => {
    page = pdf.addPage([595.28, 841.89]);
    y = height - 56;
  };
  const line = (text: string, size = 10, isBold = false, color = rgb(0.12, 0.16, 0.23)) => {
    if (y < 112) nextPage();
    page.drawText(text, { x: 46, y, size, font: isBold ? bold : regular, color }); y -= size + 8;
  };
  page.drawRectangle({ x: 0, y: height - 105, width, height: 105, color: rgb(0.05, 0.12, 0.22) });
  page.drawText("SAFETY QUEST", { x: 46, y: height - 53, size: 12, font: bold, color: rgb(0.45, 0.83, 1) });
  page.drawText("위험성 평가 보고서", { x: 46, y: height - 82, size: 25, font: bold, color: rgb(1, 1, 1) });
  y = height - 140;
  const analysis = cycle.ai_analysis || {};
  line(`보고서 ID: ${cycle.id}`, 9);
  line(`인증 번호: ${certificateNumber}`, 9);
  line(`신고 일시: ${new Date(cycle.reported_at).toISOString()}`, 9);
  line(`상태: ${safeText(cycle.status)}`, 9);
  y -= 8;
  line("위험 요약", 15, true, rgb(0.03, 0.39, 0.58));
  for (const text of wrap(`위치: ${safeText(cycle.location_description)} 내용: ${safeText(cycle.hazard_description)}`, 52)) line(text);
  y -= 6;
  line("AI 평가", 15, true, rgb(0.03, 0.39, 0.58));
  line(`위험 수준: ${safeText(analysis.riskLevel)}    위험 점수: ${safeText(analysis.riskScore)}`);
  for (const text of wrap(`위험 요인: ${safeText(analysis.riskFactor)}`, 52)) line(text);
  for (const text of wrap(`불안전 상태: ${safeText(analysis.unsafeCondition)}`, 52)) line(text);
  y -= 6;
  line("권고 조치", 15, true, rgb(0.03, 0.39, 0.58));
  const steps = Array.isArray(analysis.remediationSteps) ? analysis.remediationSteps : [];
  (steps.length ? steps : ["Review the hazard and implement suitable control measures."]).slice(0, 8).forEach((step: unknown, index: number) => {
    wrap(`${index + 1}. ${safeText(step)}`, 52).forEach((text) => line(text));
  });
  y -= 8;
  line(`조치 완료 메모: ${safeText(cycle.completion_note)}`, 9);
  const verificationUrl = `https://www.safety-road.online/verify-certificate?certificateNumber=${encodeURIComponent(certificateNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 0, width: 96 });
  const qrBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]), (char) => char.charCodeAt(0));
  const qr = await pdf.embedPng(qrBytes);
  page.drawImage(qr, { x: width - 142, y: 52, width: 72, height: 72 });
  page.drawText("스캔하여 인증서 확인", { x: width - 142, y: 40, size: 7, font: regular, color: rgb(0.35, 0.4, 0.46) });
  page.drawLine({ start: { x: 46, y: 42 }, end: { x: width - 156, y: 42 }, thickness: 0.5, color: rgb(0.65, 0.7, 0.75) });
  page.drawText("Safety Quest에서 생성", { x: 46, y: 28, size: 8, font: regular, color: rgb(0.35, 0.4, 0.46) });
  return pdf.save();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return withSupabase({ auth: "user" }, async (_request, ctx) => {
    try {
      if (req.method !== "POST") return Response.json({ error: { message: "POST required" } }, { status: 405, headers: corsHeaders });
      // @supabase/server currently does not populate userClaims for every
      // modern publishable-key session. Validate the bearer token explicitly
      // with GoTrue instead of treating a missing wrapper claim as anonymous.
      const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
      const { data: authData, error: authError } = bearer
        ? await ctx.supabaseAdmin.auth.getUser(bearer)
        : { data: { user: null }, error: new Error("Missing bearer token") };
      const userId = authError ? null : authData.user?.id;
      if (!userId) return Response.json({ error: { message: "Authentication required" } }, { status: 401, headers: corsHeaders });
      const { cycleId } = await req.json();
      if (typeof cycleId !== "string" || !cycleId) return Response.json({ error: { message: "cycleId is required" } }, { status: 400, headers: corsHeaders });
      const admin = ctx.supabaseAdmin;
      const [{ data: cycle, error: cycleError }, { data: profile }] = await Promise.all([
        admin.from("hazard_cycles").select("*").eq("id", cycleId).single(),
        admin.from("profiles").select("role").eq("id", userId).single(),
      ]);
      if (cycleError || !cycle) return Response.json({ error: { message: "Hazard cycle not found" } }, { status: 404, headers: corsHeaders });
      const manager = ["SUPERVISOR", "SAFETY_MANAGER", "ADMIN", "PROJECT_ADMIN"].includes(profile?.role);
      if (cycle.reporter_id !== userId && !manager) return Response.json({ error: { message: "Not permitted" } }, { status: 403, headers: corsHeaders });
      const { data: existing } = await admin.from("hazard_certificates").select("storage_path,certificate_number").eq("cycle_id", cycleId).maybeSingle();
      const path = existing?.storage_path || `${cycle.reporter_id}/risk-reports/${cycle.id}.pdf`;
      const certificateNumber = existing?.certificate_number || `SQ-RISK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${cycle.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
      if (!existing) {
        const bytes = await createPdf(cycle, certificateNumber);
        // A prior interrupted issuance can leave an orphaned private object.
        // It is safe to replace only this user's deterministic certificate path.
        const { error: uploadError } = await admin.storage.from("generated-docs").upload(path, bytes, { contentType: "application/pdf", upsert: true });
        if (uploadError) throw uploadError;
        const { error: certificateError } = await admin.from("hazard_certificates").insert({ cycle_id: cycle.id, user_id: cycle.reporter_id, storage_path: path, certificate_number: certificateNumber });
        if (certificateError) throw certificateError;
      }
      const { data: signed, error: signedError } = await admin.storage.from("generated-docs").createSignedUrl(path, 300);
      if (signedError) throw signedError;
      return Response.json({ signedUrl: signed.signedUrl, certificateNumber, expiresIn: 300 }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (error) {
      console.error("generate-risk-pdf failed", error instanceof Error ? error.message : "unknown");
      return Response.json({ error: { message: "Risk PDF generation failed" } }, { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  })(req);
});
