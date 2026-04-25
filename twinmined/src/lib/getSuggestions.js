export async function getSuggestions(transcript, previousSuggestions, suggestionPrompt, apiKey) {
    try {
        const res = await fetch("/api/suggestions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify({
                transcript,
                previousSuggestions,
                prompt: suggestionPrompt
            }),
        });

        const data = await res.json();

        return data?.suggestions || [];

    } catch (err) {
        console.error("API ERROR:", err);
        return [];
    }
}