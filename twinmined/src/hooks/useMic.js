import { useState, useRef } from "react";

export default function useMic(setTranscript) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const getTime = () => new Date().toLocaleTimeString();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 2000) {
          const audioBlob = new Blob([event.data], {
            type: "audio/webm",
          });

          try {
            const text = await sendAudioToBackend(audioBlob);

            if (!text || text.trim().length < 2) return;

            setTranscript((prev) => prev + `\n[${getTime()}] ${text}`);
          } catch (err) {
            console.error("Chunk transcription failed:", err);
          }
        }
      };

      mediaRecorder.start(30000);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    mediaRecorderRef.current.stream
      .getTracks()
      .forEach((track) => track.stop());
  };

  const sendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");

    let text = "";

    try {
      const apiKey = localStorage.getItem("groq_key") || "";

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
        },
        body: formData,
      });

      const data = await res.json();
      text = data.text || "";
    } catch (err) {
      console.error("Transcription error:", err);
    }

    return text;
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}
