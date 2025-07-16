import React from "react";
import IconicBtn from "./IconicBtn";

export default function FeaturesCard({icon, title, descritption, style}) {
  return (
    <div className="px-4 py-10 rounded-xl border-2 border-[#0A151914] w-full text-center group  hover:border-[#0a151933] hover:shadow-xl duration-300">
      <div className="w-full flex justify-center items-center group-hover:animate-bounce">
        <IconicBtn
          icon={icon}
          style={`text-white rounded-full inline-flex ${style}`}
        />
      </div>

      <h3 className="pb-3 pt-8 text-2xl font-semibold">
        {title}
      </h3>
      <p className="text-base font-medium text-[#0A1519B2]">
        {descritption}
      </p>
    </div>
  );
}
