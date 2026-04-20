import Avatar from "../ui/Avatar";

function parseText(text, mentions = [], channels = []) {
  const parts = text.split(/(@\S+|#\S+)/g);
  return parts.map((part, i) => {
    if (mentions.includes(part) || channels.includes(part)) {
      return <span key={i} className="text-teal cursor-pointer hover:underline">{part}</span>;
    }
    return part;
  });
}

export default function MessageItem({ message }) {
  return (
    <div className="flex gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group">
      <Avatar initials={message.initials} color={message.color} size={34} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-[13px] font-semibold text-gray-100">{message.senderName}</span>
          <span className="text-[12px] text-gray-600">{message.time}</span>
        </div>
        <p className="text-[14px] text-gray-300 leading-relaxed">
          {parseText(message.text, message.mentions, message.channels)}
        </p>
      </div>
    </div>
  );
}