"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export default function FeatureCard({
  title,
  description,
  whyItMatters,
  imagePosition = "right",
  image,
}) {
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div
        className={cn(
          "flex flex-col gap-12 items-start",
          imagePosition === "left" ? "lg:flex-row-reverse" : "lg:flex-row",
        )}
      >
        {/* Image Placeholder */}
        <div className="w-full lg:w-[420px] h-[300px] lg:h-[480px] bg-linear-to-br from-gray-100 to-gray-200 rounded-xl shrink-0 overflow-hidden">
          <Image className="h-full" src={image} alt="image" width={420} height={480} />
        </div>

        {/* Content */}
        <div className="flex-1 w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>

          {/* What It Is */}
          {description && (
            <>
              <h3 className="font-semibold text-gray-900 mb-3">What It Is</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {description}
              </p>
            </>
          )}

          {/* Why It Matters */}
          {whyItMatters && (
            <>
              <h3 className="font-semibold text-gray-900 mb-3">
                Why It Matters
              </h3>

              {Array.isArray(whyItMatters) ? (
                whyItMatters.map((line, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-3">
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-gray-700 leading-relaxed mb-4">
                  {whyItMatters}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
