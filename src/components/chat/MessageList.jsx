import { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";

export default function MessageList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {/* Date divider */}
      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[12px] text-gray-600">Today</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {messages.map((msg) => <MessageItem key={msg.id} message={msg} />)}
      <div ref={bottomRef} />
    </div>
  );
}