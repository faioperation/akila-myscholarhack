import { Icon } from "@iconify/react";
export default function ProblemPoint({ title, description, icon, anim }) {
  return (
    <div className="border-l-2 border-[#C4C4C4] pl-3 py-3 group hover:cursor-pointer hover:border-[#FFE7A8] duration-300">
      <div className="bg-[#FFFAEC]  inline-flex p-2 rounded-lg">
        <Icon
          className={`p-1 text-[#E8B83C] ${anim}`}
          icon={icon}
          width="32"
          height="32"
        />
      </div>
      <h3 className="text-[32px] font-semibold py-4">{title}</h3>
      <p className="text-xl">{description}</p>
    </div>
  );
}
