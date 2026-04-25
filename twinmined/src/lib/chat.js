export async function sendChat(message, transcript){
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message,
            transcript
        }),
    });

    const data = await res.json();
    return data.reply;
}