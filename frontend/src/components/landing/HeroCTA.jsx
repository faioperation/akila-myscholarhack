"use client";
import Image from "next/image";
import { Icon } from "@iconify/react";
import PrimaryBtn from "./PrimaryBtn";
import { redirect } from "next/navigation";

export default function HeroCTA() {

  
  return (
    <section className="w-full flex justify-center px-0 py-10">
      <div
        className="
          w-full max-w-7xl rounded-[40px] 
          bg-[url('/backgroundImage.png')] 
          bg-cover bg-center bg-no-repeat 
          text-white py-20 px-6 text-center
        "
      >
        {/* Rating */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {/* 5 stars */}
            {[1, 2, 3, 4, 5].map((i) => (
              <Icon
                key={i}
                icon="mdi:star"
                className="text-yellow-400"
                width={20}
                height={20}
              />
            ))}
            <span className="text-lg ml-2 opacity-90">4.9/5</span>
          </div>

          {/* Profile images */}
          <div className="flex items-center gap-2 mt-2">
            
            <Image
              src="/Courtney-M2.jpg"
              width={35}
              height={35}
              className="rounded-full"
              alt="Featured User"
            />
            <Image
              src="/Marcus-T2.png"
              width={35}
              height={35}
              className="rounded-full"
              alt="Featured User"
            />
            <Image
              src="/Priya-K2.png"
              width={35}
              height={35}
              className="rounded-full"
              alt="Featured User"
            />

            <div className="bg-white text-black text-xs px-3 py-3 rounded-full">
              100k+
            </div>
          </div>

          <p className="opacity-70 mt-2 text-sm">Students Join us</p>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
          Ready to Write Essays
          <br />
          That Win?
        </h1>

        {/* Subtitle */}
        <p className="mt-4 opacity-70 text-sm md:text-base">
          Start with one free essay. No credit card required
        </p>

        <div className="flex items-center justify-center mt-8">
            <PrimaryBtn hendleClick={() => redirect("/pricing")} icon={"mdi:arrow-right"} title={"Start Your Free Trial"} style={"rounded-full"} />
        </div>

        
      </div>
    </section>
  );
}


