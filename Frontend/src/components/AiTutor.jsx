import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { fetchAiChat } from "@/api";

export default function AiTutor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Moni! 👋 I'm your AI Study Tutor for Learn Malawi. Ask me anything about your studies — Mathematics, Science, English, Chichewa, History, and more. I'm here to help you excel! 🎓",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const prompt = `You are a friendly Malawi study tutor. Answer the student's question clearly, gently, and with examples. Student asked: ${input}`;

    try {
      const response = await fetchAiChat(prompt);
      const assistantText = typeof response === "string" ? response : response?.text || "Sorry, I couldn't generate an answer right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect to the AI service. Please try again later.",
        },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-blue-950 border-2 border-blue-800 rounded-full p-4 shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
        >
          <Bot className="h-6 w-6" />
          <span className="text-sm font-semibold pr-1">AI Tutor</span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-card border-2 border-blue-800 rounded-2xl shadow-2xl flex flex-col" style={{ height: "500px" }}>
          {/* Header */}
          <div className="bg-yellow-400 text-blue-950 px-4 py-3 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-900 rounded-full p-1">
                <Bot className="h-4 w-4 text-yellow-300" />
              </div>
              <div>
                <p className="font-semibold text-sm">AI Study Tutor</p>
                <p className="text-xs text-blue-900/80">Malawi Curriculum Expert</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-blue-950/10 rounded-lg p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-yellow-400 text-blue-950 rounded-br-sm border border-blue-800/40"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything..."
              className="flex-1 text-sm bg-muted rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-700"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-yellow-400 text-blue-950 border border-blue-800 rounded-xl p-2 hover:bg-yellow-300 disabled:opacity-50 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}