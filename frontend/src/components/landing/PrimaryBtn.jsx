"use client"

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export default function PrimaryBtn({ title, style, hendleClick, icon, children }) {
  return (
    <button
      onClick={hendleClick}
      className={cn(
        "font-medium text-sm md:text-base text-[#1B1B1B] bg-[#FFCA42] py-3.5 px-6 hover:bg-[#ffc942c2] duration-300",
        icon && "flex items-center justify-center gap-3 hover:gap-5",
        style
      )}
    >
      {title}
      <Icon icon={icon} width="20" height="20" />
    </button>
  );
}
