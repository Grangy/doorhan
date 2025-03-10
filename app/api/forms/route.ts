import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Отправка сообщения в Telegram через бота
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (telegramBotToken && telegramChatId) {
      // Формируем URL для отправки сообщения через Telegram Bot API
      const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramChatId}`;

      // Формируем текст сообщения для Telegram
      const telegramMessage = `Новая заявка с сайта:\n` +
        `Имя: ${data.name}\n` +
        `Телефон: ${data.phone}\n` +
        `Сообщение: ${data.message}\n` +
        `Страница: ${data.page}\n` +
        `Время: ${new Date().toISOString()}`;

      const telegramPayload = {
        text: telegramMessage,
        parse_mode: "HTML",
      };

      // Отправляем сообщение в Telegram
      const telegramRes = await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(telegramPayload),
      });

      if (!telegramRes.ok) {
        console.error("Failed to send message to Telegram");
        return NextResponse.json(
          { error: "Failed to send message to Telegram" },
          { status: 500 }
        );
      }
    } else {
      console.error("Telegram Bot Token or Chat ID not configured");
      return NextResponse.json(
        { error: "Telegram configuration is missing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing form:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
