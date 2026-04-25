export async function POST(req) {
  try {
    const { transcript, previousSuggestions, prompt } = await req.json();
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 400 });
    }

    const formattedPrevious =
      previousSuggestions
        ?.map((s) => `${s.type || "unknown"}: ${s.text}`)
        .join("\n") || "None";

    const finalPrompt =
      `You are an intelligent real-time meeting assistant.

Your job is to help the user actively participate in a conversation by suggesting what they should say, ask, or think next.

Conversation:
${transcript}

Previous suggestions:
${formattedPrevious}

IMPORTANT RULES:
- Generate exactly 3 suggestions
- Each must be a different type: answer, question, insight
- DO NOT repeat or summarize what is already said
- DO NOT say obvious things like "it is working"
- Each suggestion must provide NEW value
- DO NOT repeat any idea or wording from previous suggestions
- If a similar suggestion was already given, generate a completely different angle

QUALITY REQUIREMENTS:
- Be specific, not generic
- Help the user move the conversation forward
- Suggest something the user might not think of immediately
- Focus on the MOST RECENT part of the conversation
- Prioritize recent conversation
- Avoid generic suggestions
- If user is asking question → give answer
- If discussion → give insight or next step

TYPES:
- answer → Give a strong, useful response the user can say
- Avoid overly technical formatting unless necessary
- Prefer short paragraphs or bullet points
- Keep it readable in a chat interface

- question → Ask something that deepens the discussion

- insight → Highlight a hidden issue, improvement, or angle

Return ONLY JSON:
[
  { "type": "answer", "text": "..." },
  { "type": "question", "text": "..." },
  { "type": "insight", "text": "..." }
]`;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that returns structured suggestions.",
            },
            { role: "user", content: finalPrompt },
          ],
          temperature: 0.7,
        }),
      },
    );

    const data = await groqRes.json();

    if (!groqRes.ok) {
      console.error("Groq error:", data);
      return Response.json(
        { error: data.error?.message || "Suggestion failed" },
        { status: 400 },
      );
    }

    const text = data.choices?.[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse failed. Raw output:", text);

      parsed = text
        .split("\n")
        .filter((line) => line.trim())
        .slice(0, 3)
        .map((line) => ({
          text: line.replace(/^[0-9.\-\s]+/, "").trim(),
        }));
    }

    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    parsed = parsed.map((item) => ({
      text:
        (typeof item === "object" && item.text) ||
        (typeof item === "string" && item) ||
        "No suggestion",
    }));

    while (parsed.length < 3) {
      parsed.push({ text: "No suggestion available" });
    }

    parsed = parsed.slice(0, 3);

    return Response.json({
      suggestions: parsed,
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return Response.json({ error: "Suggestion failed" }, { status: 500 });
  }
}
