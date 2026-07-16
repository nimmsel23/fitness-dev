// telegramClient.mjs
// Simple wrapper for sending a message to one or more Telegram chat IDs.

export async function sendTelegramMessage(botToken, chatIds, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: null, // will be overridden per chatId
    text: text,
    parse_mode: "HTML"
  };

  const promises = chatIds.map(async chatId => {
    const body = { ...payload, chat_id: chatId };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`Telegram error for ${chatId}: ${res.status} ${err}`);
    }
  });

  await Promise.all(promises);
}
