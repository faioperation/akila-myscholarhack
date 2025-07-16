import { usePathname } from "next/navigation";
import React, { Children } from "react";

export default function HeaderBG({Height, children}) {
  const pathName = usePathname()

  return (
    <section
      style={{
        backgroundImage: "url('/HeroSection.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className={`w-full ${pathName === "/" ? "h-[920px] md:h-[980px] lg:h-[1152px]" : pathName === "/about" ? "lg:h-[765px]":"lg:h-[565px]"}`}
    >
        {children}
    </section>
  );
}
