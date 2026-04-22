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
      const assistantText = response?.content || response?.text || (typeof response === "string" ? response : "Sorry, I couldn't generate an answer right now.");
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
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
          aria-label="Open AI Study Tutor chat"
        >
          <Bot className="h-6 w-6" />
          <span className="text-sm font-semibold pr-1">AI Tutor</span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col" style={{ height: "500px" }} role="dialog" aria-label="AI Study Tutor" aria-modal="true">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-secondary rounded-full p-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">AI Study Tutor</p>
                <p className="text-xs text-primary-foreground/70">Malawi Curriculum Expert</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-primary-foreground/10 rounded-lg p-1" aria-label="Close AI tutor">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite" aria-label="Chat messages" role="log">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
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
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
              aria-label="Type your question"
              className="flex-1 text-sm bg-muted rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-primary text-primary-foreground rounded-xl p-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
