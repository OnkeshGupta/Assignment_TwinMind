"use client";
import useMic from "@/hooks/useMic";
import { useEffect, useRef, useState } from "react";
import { getSuggestions } from "@/lib/getSuggestions";
import { sendChat } from "@/lib/chat";
import ReactMarkdown from "react-markdown";
import { Download, Mic, RotateCw } from "lucide-react";

export default function Home() {
  const getTime = () => new Date().toLocaleTimeString();

  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState("");
  const [suggestionBatches, setSuggestionBatches] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isGeneratingRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [apiKey, setApiKey] = useState(
    typeof window !== "undefined" ? localStorage.getItem("groq_key") || "" : "",
  );

  const suggestionPrompt = `
You are a real-time meeting assistant.
Analyze ONLY the recent conversation and return EXACTLY 3 suggestions:
1. One direct answer
2. One follow-up question
3. One insight
Keep it short. No repetition.
`;

  const generateSuggestions = async (fullTranscript) => {
    if (!transcript || !transcript.trim()) {
      return;
    }

    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    try {
      const previous = suggestionBatches.flatMap((b) => b.data);
      const lastChunk = fullTranscript.split("\n").slice(-10).join("\n");

      const result = await getSuggestions(
        lastChunk,
        previous,
        suggestionPrompt,
        apiKey,
      );

      let parsed = [];

      if (Array.isArray(result)) {
        parsed = result;
      } else if (result?.text) {
        parsed = [{ text: result.text }];
      } else {
        parsed = [];
      }

      setSuggestionBatches((prev) => [
        { time: getTime(), data: parsed },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      isGeneratingRef.current = false;
    }
  };

  const { isRecording, startRecording, stopRecording } = useMic(setTranscript);

  useEffect(() => {
    if (!transcript.trim()) return;

    const timeout = setTimeout(() => {
      generateSuggestions(transcript);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [transcript]);

  const handleSuggestionClick = async (text) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);

    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: text, time: getTime() },
      { role: "assistant", content: "Thinking...", time: getTime() },
    ]);

    let reply = "Error";

    try {
      reply = await sendChat(text, transcript, apiKey);
    } catch (e) {
      console.error(e);
    }

    setChatMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: "assistant",
        content: reply,
        time: getTime(),
      };
      return updated;
    });

    setIsLoading(false);
  };

  const handleExport = () => {
    const data = { transcript, suggestionBatches, chatMessages };
    const blob = new Blob([JSON.stringify(data, null, 2)]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "session.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <main className="h-screen flex overflow-hidden bg-black text-white pt-16">
      {/* HEADER */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 flex items-center gap-3 shadow">
          <input
            type="password"
            placeholder="Enter Groq API Key"
            value={apiKey}
            onChange={(e) => {
              const key = e.target.value;
              setApiKey(key);
              localStorage.setItem("groq_key", key);
            }}
            className="bg-black px-3 py-1 rounded-md outline-none text-sm w-[240px]"
          />

          <span className="text-xs text-green-400">
            {mounted && apiKey ? "Saved ✓" : ""}
          </span>
        </div>
      </div>

      {/* LEFT PANEL */}
      <div className="w-1/3 border-r border-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Transcript</h2>

        <div className="flex gap-2 mb-3">
          <button
            onClick={handleExport}
            className="bg-green-600 px-3 py-1 rounded"
          >
            Export
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-3 py-1 rounded ${
              isRecording ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            {isRecording ? "Stop" : "Record"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto text-sm whitespace-pre-wrap bg-gray-900 p-3 rounded">
          {transcript || "Start speaking..."}
        </div>
      </div>

      {/* MIDDLE PANEL */}
      <div className="w-1/3 border-r border-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Suggestions</h2>

        <button
          onClick={() => generateSuggestions(transcript)}
          disabled={!transcript.trim()}
          className={`mb-3 px-3 py-1 rounded ${
            transcript.trim()
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-800 opacity-50 cursor-not-allowed"
          }`}
        >
          <RotateCw size={16} />
          Reload
        </button>

        <div className="flex-1 overflow-y-auto space-y-3">
          {suggestionBatches.map((batch, i) => (
            <div key={i}>
              <div className="text-xs text-gray-400 mb-1">{batch.time}</div>

              {Array.isArray(batch.data) &&
                batch.data.map((s, j) => (
                  <div
                    key={j}
                    onClick={() => handleSuggestionClick(s.text)}
                    className={`bg-gray-900 p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2
    ${j === 0 ? "border-l-4 border-blue-500" : ""}
    ${j === 1 ? "border-l-4 border-green-500" : ""}
    ${j === 2 ? "border-l-4 border-purple-500" : ""}
    hover:scale-[1.02] hover:shadow-lg`}
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {j === 0 && "Answer"}
                      {j === 1 && "Question"}
                      {j === 2 && "Insight"}
                    </div>

                    <div className="text-sm leading-relaxed">{s.text}</div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/3 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Chat</h2>

        <div className="flex-1 overflow-y-auto space-y-3 text-sm">
          {chatMessages.map((msg, i) => (
            <div key={i}>
              <div className="text-xs text-gray-400">{msg.time}</div>
              <div className="bg-gray-900 p-2 rounded">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2 mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-900 px-3 py-2 rounded outline-none"
            placeholder="Ask something..."
          />
          <button
            onClick={() => {
              handleSuggestionClick(input);
              setInput("");
            }}
            className="bg-blue-600 px-3 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
