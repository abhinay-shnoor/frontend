import Avatar from "../ui/Avatar";

export default function DMItem({ dm }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-1.5 cursor-pointer
                    hover:bg-white/5 dark:hover:bg-white/5
                    light:hover:bg-black/5 transition-colors">
      <Avatar initials={dm.initials} color={dm.color} avatarUrl={dm.avatarUrl} size={28} />
      <span className="text-[13px] text-gray-200 dark:text-gray-200">{dm.name}</span>
    </div>
  );
}