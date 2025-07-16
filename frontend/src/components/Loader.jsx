"use client";
import React from "react";
import { Icon } from "@iconify/react";

export default function Loader({ fullScreen = true }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="eos-icons:loading" width={50} height={50} className="text-amber-500 animate-spin" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[60vh]">
       <div className="flex flex-col items-center gap-3">
          <Icon icon="eos-icons:loading" width={40} height={40} className="text-amber-500 animate-spin" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
       </div>
    </div>
  );
}
