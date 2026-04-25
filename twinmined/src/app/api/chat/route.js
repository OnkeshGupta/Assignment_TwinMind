export async function POST(req){
    try {
        const {message, transcript} = await req.json();

        const prompt = `You are a helpful meeting assistant.

            User message:
            ${message}

            Conversation context:
            ${transcript}

            Give a clear, helpful, slightly detailed response.`
        
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    {role: "system", content: `
                        You are a real-time meeting assistant.

                        Rules:
                        - Give short, clear, conversational answers
                        - NO tables
                        - NO markdown formatting like | or HTML tags
                        - Use simple sentences
                        - Keep it under 4-5 lines
                        - Sound like a human speaking in a meeting
                        - If the response includes tables or markdown, rewrite it as plain text.
                        `
                    },
                    {role: "user", content: prompt}
                ],
                temperature: 0.7
            }),
        });

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;

        return Response.json({reply});
    } catch (err) {
        console.error(err);
        return Response.json({error: "Chat failed"}, {status: 500});
    }
}