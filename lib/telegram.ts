// Telegram sender for the visitor alerts (lib/visits.ts). A missing token or
// chat id only skips the notification, it never breaks the feature that tried
// to notify. Same as hadarahospitality's lib/telegram.ts.
function telegramBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN;
}

function telegramChatId(): string | undefined {
  return process.env.TELEGRAM_CHAT_ID;
}

export function hasTelegramConfigured(): boolean {
  return Boolean(telegramBotToken() && telegramChatId());
}

/** Calls a Bot API method for the team's chat. Throws when Telegram refuses
 * it, so the caller's .catch() can log it — a failed notification must never
 * fail the feature that triggered it (the visit was already tracked, the RFQ
 * already saved). The error never includes the token, which is in the URL. */
async function callTelegram(method: string, body: Record<string, unknown>, toChat = true, timeoutMs = 5000): Promise<{ message_id?: number } | undefined> {
  const token = telegramBotToken();
  const chatId = telegramChatId();
  if (!token || !chatId) return undefined;
  const payload = toChat ? { chat_id: chatId, parse_mode: 'HTML', disable_web_page_preview: true, ...body } : body;
  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new Error(`Telegram ${method}: unreachable`);
  }
  const result = (await response.json().catch(() => ({}))) as { result?: { message_id?: number }; description?: string };
  if (!response.ok) throw new Error(`Telegram API error ${response.status}: ${result.description ?? ''}`);
  return result.result;
}

/** Sends `text` (Telegram HTML, values already escaped), as a reply when
 * `replyTo` is given, and returns the new message's id. */
export async function sendTelegramMessage(text: string, replyTo?: number | null): Promise<number | undefined> {
  const result = await callTelegram('sendMessage', {
    text,
    ...(replyTo ? { reply_parameters: { message_id: replyTo, allow_sending_without_reply: true } } : {}),
  });
  return result?.message_id;
}

/** Replaces the text of an earlier message; an edit rings no notification. */
export async function editTelegramMessage(messageId: number, text: string): Promise<void> {
  await callTelegram('editMessageText', { message_id: messageId, text });
}
