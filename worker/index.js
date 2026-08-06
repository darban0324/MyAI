export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message } = await request.json();

        if (!message || !message.trim()) {
          return new Response(
            JSON.stringify({ error: "Message is required" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }

        const systemInstruction = `
You are MY AI, a helpful general-purpose AI assistant.

Detect the user's language automatically and reply in the same language.
For Urdu, Arabic and Persian, naturally use right-to-left text.
For English and other languages, use normal left-to-right text.
Give clear, useful and natural answers.
Follow the user's requested format, length and style.
`;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              contents: [
                {
                  parts: [{ text: message }],
                },
              ],
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return new Response(JSON.stringify({
            error: data.error?.message || "Gemini API error"
          }), {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        const reply =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I could not generate a response.";

        return new Response(JSON.stringify({ reply }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });

      } catch (error) {
        return new Response(JSON.stringify({
          error: error.message || "AI service error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new Response("MY AI Worker is running");
  },
};
