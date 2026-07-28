import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const MAX_TEXT_LENGTH = 8_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type AnalysisRequest = { inputType?: string; inputText?: string; content?: string; context?: { workType?: string; location?: string; workerCount?: number; currentTask?: string } };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
}

function bytesToBase64(bytes: Uint8Array) {
  let result = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) result += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return btoa(result);
}

function parseModelJson(text: string) {
  return JSON.parse(text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, ""));
}

function buildPrompt(inputText: string, context?: AnalysisRequest["context"]) {
  const contextLines = [context?.workType && `작업 유형: ${context.workType}`, context?.location && `장소: ${context.location}`, Number.isFinite(context?.workerCount) && `작업 인원: ${context?.workerCount}명`, context?.currentTask && `현재 작업: ${context.currentTask}`].filter(Boolean);
  return `당신은 대한민국 산업안전보건 현장의 위험성평가 보조자입니다. 제공된 내용과 사진(있다면)을 바탕으로, 추측은 명확히 표시하고 즉시 조치가 필요한 위험을 우선합니다. 법령·KOSHA 안내 코드는 확실할 때만 제시합니다. 다음 JSON 객체만 반환하세요.\n\n{"riskFactor":"핵심 위험요인 요약","remediationSteps":["우선 조치 1","우선 조치 2","우선 조치 3"],"referenceCode":"확실한 경우에만 KOSHA 코드, 아니면 null","riskLevel":"LOW | MEDIUM | HIGH | CRITICAL","hazardClassification":"위험 분류","unsafeCondition":"불안전한 상태","unsafeAct":"불안전한 행동","possibleAccident":"예상 사고","severity":{"score":1,"rationale":"근거"},"likelihood":{"score":1,"rationale":"근거"},"legalBasis":[{"law":"법령명","article":"조항","content":"적용 근거"}],"koshaGuide":"확실한 경우에만 코드, 아니면 null","controlMeasures":{"immediate":["즉시"],"engineering":["공학적"],"administrative":["관리적"],"ppe":["보호구"]},"responsibleRole":"조치 책임 역할","dueDays":1,"confidence":0.0}\n\nseverity.score와 likelihood.score는 1~5 정수, confidence는 0~1 숫자입니다.\n\n현장 설명:\n${inputText}${contextLines.length ? `\n\n추가 맥락:\n${contextLines.join("\n")}` : ""}`;
}

async function readRequest(req: Request): Promise<{ request: AnalysisRequest; image?: { mimeType: string; data: string } }> {
  if (!((req.headers.get("content-type") ?? "").includes("multipart/form-data"))) return { request: await req.json() };
  const form = await req.formData();
  const contextValue = form.get("context");
  const request: AnalysisRequest = { inputType: String(form.get("inputType") ?? ""), inputText: String(form.get("inputText") ?? form.get("content") ?? ""), context: typeof contextValue === "string" && contextValue ? JSON.parse(contextValue) : undefined };
  const photo = form.get("photo");
  if (!(photo instanceof File)) return { request };
  if (!photo.type.startsWith("image/") || photo.size > MAX_IMAGE_BYTES) throw new Error("invalid image");
  return { request, image: { mimeType: photo.type, data: bytesToBase64(new Uint8Array(await photo.arrayBuffer())) } };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return withSupabase({ auth: "user" }, async (_request, ctx) => {
    if (req.method !== "POST") return json({ error: { message: "POST 요청만 허용됩니다." } }, 405);
    try {
      const { request, image } = await readRequest(req);
      const inputText = (request.inputText ?? request.content ?? "").trim();
      if (!inputText || inputText.length > MAX_TEXT_LENGTH) return json({ error: { message: "현장 설명은 1~8,000자로 입력해 주세요." } }, 400);
      const apiKey = Deno.env.get("GEMINI_API_KEY");
      if (!apiKey) return json({ error: { message: "AI 서비스가 설정되지 않았습니다." } }, 503);
      const parts: Array<Record<string, unknown>> = [{ text: buildPrompt(inputText, request.context) }];
      if (image) parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
      const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: "application/json" } }) });
      if (!geminiResponse.ok) { console.error("Gemini request failed", geminiResponse.status); return json({ error: { message: "AI 분석 요청을 처리하지 못했습니다." } }, 502); }
      const gemini = await geminiResponse.json();
      const text = gemini?.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => part.text)?.text;
      if (!text) return json({ error: { message: "AI 분석 결과를 생성하지 못했습니다." } }, 502);
      const analysis = parseModelJson(text);
      const severity = Number(analysis?.severity?.score), likelihood = Number(analysis?.likelihood?.score);
      const result = { ...analysis, analysisId: `analysis-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`, actionRecordId: crypto.randomUUID(), analyzedAt: new Date().toISOString(), riskScore: Number.isInteger(severity) && Number.isInteger(likelihood) ? severity * likelihood : null };
      const { error: historyError } = await ctx.supabaseAdmin.from("ai_analysis_history").insert({ user_id: ctx.userClaims?.sub, analysis_id: result.analysisId, input_text: inputText, input_type: request.inputType || (image ? "PHOTO" : "TEXT"), context: request.context || {}, result });
      if (historyError) { console.error("analysis history insert failed", historyError.message); return json({ error: { message: "분석 이력을 저장하지 못했습니다." } }, 500); }
      return json(result);
    } catch (error) {
      console.error("ai-analyze failed", error instanceof Error ? error.message : "unknown error");
      return json({ error: { message: "AI 분석 요청 형식이 올바르지 않습니다." } }, 400);
    }
  })(req);
});
