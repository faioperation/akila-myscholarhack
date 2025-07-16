import { Icon } from "@iconify/react";


export default function securityCard({title, description, icon}) {
  return (
    <div className="border border-[#0A151914] rounded-2xl py-10 px-4 hover:shadow-xl duration-300">
      <div className="p-2.5 rounded-full text-[#FFE7A8] border border-[#FFE7A8] inline-flex ">
        <Icon
          icon={icon}
          width={28}
          height={28}
        />
      </div>
      <h4 className="pt-8 text-2xl font-semibold">{title}</h4>
      <p className="pb-3 text-[#0A1519B2] font-medium">{description}</p>
    </div>
  );
}
