"use client";
import { useState } from "react";
import SwitchBtn from "./switchBtn";
import SectionHead from "../SectionHead";
import Container from "../Container";
import PrimaryBtn from "../PrimaryBtn";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllPlans, apiGet } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import toast from "react-hot-toast";

export default function PricingSection() {
  const [plans, setPlans] = useState(false);
  const router = useRouter();

  const {
    data: plansResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allPlans"],
    queryFn: getAllPlans,
  });

  const handlePlanClick = async (plan, isYearly) => {
    // Check authentication strictly (dependent on cookies now)
    const isUserAuthenticated = isAuthenticated();

    console.log(plan.name);

    if (isUserAuthenticated) {
      try {
        const response = await apiGet(
          `/payment/checkout/${plan.name}?durationType=${isYearly ? "YEARLY" : "MONTHLY"}`,
        );

        // Try different response structures as API might return data wrapped or direct
        const checkoutUrl =
          response?.url ||
          response?.data?.url ||
          response?.checkoutUrl ||
          response?.data?.checkoutUrl;

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast.error("Failed to initialize checkout. Please try again.");
        }
      } catch (err) {
        // console.error("Checkout error:", err);
        // If 401, they might have been logged out, so redirect to signin
        if (err?.status === 401) {
          router.push("/signin");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    } else {
      // Sync localStorage if cookies were manually cleared
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedPlan", plan.name);
      }
      router.push("/signin");
    }
  };

  if (isLoading) {
    return (
      <section className="w-full py-20 bg-white">
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFCA42]"></div>
            <p className="mt-4 text-gray-600">Loading plans...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-20 bg-white">
        <Container>
          <div className="text-center text-red-500">
            <p>Error loading pricing plans. Please try again later.</p>
          </div>
        </Container>
      </section>
    );
  }

  const pricingPlans = (plansResponse?.data || []).filter(
    (plan) => plan.isActive === true,
  );
  console.log(pricingPlans);

  return (
    <section
      className={`w-full ${
        !plans
          ? "bg-[url('/backgroundImage.png')] bg-cover bg-center text-white"
          : "bg-white text-black"
      }`}
    >
      <Container>
        <div className="pt-20 lg:pt-[120px] pb-10 lg:pb-[72px] flex flex-col items-center justify-center gap-y-10 lg:gap-y-[50px]">
          <SectionHead
            Status="Pricing"
            statusStyle="text-[#FFB834] border-[#FFB834]"
            title="Find the Right Plan for a Stress-Free Scholarship Season"
            description="Whether you’re preparing early or in the middle of application season, there’s a plan designed to keep everything organized and moving forward."
          />

          <div className="pt-10">
            <SwitchBtn plans={plans} setPlans={setPlans} />
          </div>

          <p className="py-2 w-[50%] text-center">
            Most families choose{" "}
            <strong className="text-amber-300">MyScholarHack Plus</strong>{" "}
            because it offers enough flexibility to apply consistently — without
            feeling limited.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-10 lg:gap-14">
            {pricingPlans.map((plan) => (
              <div
                  key={plan.sortOrder}
                  className={`border ${
                    plan.isFeatured === true
                      ? "border-[#FFCA42]"
                      : `${plans ? "border-[#31313114]" : "border-[#FFFFFF14]"}`
                  } px-7 py-8 rounded-2xl bg-[#FFFFFF05] backdrop-blur-sm`}
                >
                  <div className="flex flex-col h-full">
                    <h2 className="text-3xl font-semibold">{plan.planType}</h2>
                    <p className="text-base pt-5 pb-10 opacity-80">
                      {plan.description}
                    </p>
                    <div className="flex items-end">
                      <h4 className="text-4xl font-semibold">
                        ${!plans ? plan.monthlyPrice : plan.yearlyPrice}
                      </h4>
                      <p className="text-base opacity-70">
                        /{!plans ? "per Month" : "per Year"}
                      </p>
                    </div>
                    <div
                      className={`flex-1 space-y-5 px-4 py-5 ${plans ? "bg-[#5858580a] border border-[#52525214]" : "bg-[#FFFFFF0A] border border-[#FFFFFF14]"} rounded-lg my-4`}
                    >
                      {/* Assuming features are returned as an array or JSON string */}
                      {(Array.isArray(plan.features) ? plan.features : []).map(
                        (feature, index) => (
                          <div key={index} className="flex gap-4">
                            <Icon
                              className="text-green-500"
                              icon="mdi:tick-circle"
                              height={20}
                              width={20}
                            />
                            <p>{feature}</p>
                          </div>
                        ),
                      )}
                    </div>
                    <PrimaryBtn
                      hendleClick={() => handlePlanClick(plan, plans)}
                      style="w-full rounded-full"
                      title={plan.buttonText || "Get Started"}
                    />
                  </div>
                </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
