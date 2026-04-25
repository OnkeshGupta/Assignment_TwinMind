export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file");

    if (!audioFile) {
      return Response.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return Response.json(
        { error: "Missing API key" },
        { status: 400 }
      );
    }

    const fd = new FormData();
    fd.append("file", audioFile);
    fd.append("model", "whisper-large-v3");
    fd.append("language", "en");

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: fd
      }
    );

    const data = await groqRes.json();
    console.log("Groq Response Full:", data);
    console.log("Groq status:", groqRes.status);

    if (!groqRes.ok) {
      return Response.json(
        { error: data.error?.message || "Transcription failed" },
        { status: 400 }
      );
    }

    return Response.json({ text: data.text || "" });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}