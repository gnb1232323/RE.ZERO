const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_IDS = (process.env.TELEGRAM_CHAT_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export async function notifyTelegram(text: string) {
  if (!BOT_TOKEN || CHAT_IDS.length === 0) return;

  await Promise.all(
    CHAT_IDS.map((chatId) =>
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }).catch((error) => {
        console.error("Failed to send Telegram notification", error);
      })
    )
  );
}
