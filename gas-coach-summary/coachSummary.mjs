// coachSummary.mjs
// End‑to‑end Node‑Script: Firestore → Gemini → Telegram (Coach‑Briefing)
// Usage (CLI):
//   node coachSummary.mjs <UID> <timeframe>
//   timeframe = daily | weekly | monthly | quarterly (maps to date range in PromptBriefings)

import { fetchUserData } from "./fetchUserData.mjs";
import { buildPrompt } from "./generatePrompt.mjs";
import { callGeminiAPI } from "./geminiClient.mjs"; // wrapper we will add
import { sendTelegramMessage } from "./telegramClient.mjs"; // wrapper we will add
import { getDateRange } from "./dateRange.mjs"; // helper to map timeframe

async function main() {
  const uid = process.argv[2] ?? process.env.USER_UID;
  const timeframe = (process.argv[3] ?? "weekly").toLowerCase();
  if (!uid) {
    console.error("❌ UID missing – provide as arg or USER_UID env var");
    process.exit(1);
  }

  // 1️⃣ Fetch user data from Firestore
  const userData = await fetchUserData(uid);

  // 2️⃣ Build Gemini prompt (workout, habits, healthMetrics)
  const prompt = buildPrompt(userData);

  // 3️⃣ Call Gemini – reuse same system instruction as in GAS version
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.error("❌ GEMINI_API_KEY env var missing");
    process.exit(1);
  }
  const response = await callGeminiAPI(geminiKey, prompt);

  // 4️⃣ Send via Telegram
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!telegramToken || chatIds.length === 0) {
    console.error("❌ Telegram credentials missing");
    process.exit(1);
  }

  const message = `🧠 <b>Coach ${timeframe.toUpperCase()} Summary for ${uid}</b>\n\n${response}`;
  await sendTelegramMessage(telegramToken, chatIds, message);
  console.log("✅ Summary sent to Telegram");
}

main().catch(e => {
  console.error("⚡ Unexpected error:", e);
  process.exit(1);
});
