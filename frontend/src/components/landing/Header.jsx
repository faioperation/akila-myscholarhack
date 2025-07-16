"use client";
import HeaderBG from "./HeaderBG";
import Container from "./Container";
import Navbar from "./Navbar";
import { usePathname, useRouter } from "next/navigation";
import Title from "./Title";
import PrimaryBtn from "./PrimaryBtn";
import SecoundryBtn from "./SecoundryBtn";
import Image from "next/image";
import dashboard from "../../../public/Dashboard.png";

export default function Header() {
  const Pathname = usePathname();
  const router = useRouter();

  if (
    !Pathname.startsWith("/signin") &&
    !Pathname.startsWith("/forgot-password") &&
    !Pathname.startsWith("/forgot-password-otp") &&
    !Pathname.startsWith("/reset-password") &&
    !Pathname.startsWith("/register") &&
    !Pathname.startsWith("/verify-email") &&
    !Pathname.startsWith("/otp") &&
    !Pathname.startsWith("/dashboard")
  ) {
    return (
      <HeaderBG Height={"h-[1152px]"}>
        <Container>
          <Navbar />
          {Pathname === "/" && (
            <div className="relative">
              <div className="w-full flex items-center justify-center">
                <div className="pt-20 pb-14 flex flex-col w-full max-w-[1063px] justify-center text-center px-4 md:px-0">
                  <div className="flex justify-center">
                    <Title title={"Trusted by thousands of students"} />
                  </div>
                  <h1 className="font-semibold text-3xl md:text-5xl lg:text-[64px] text-white text-center py-4">
                    Write Scholarship Essays That Sound Like You—Because They
                    Are You
                  </h1>
                  <p className="w-full max-w-[683px] mx-auto text-center text-white/70 text-base md:text-xl">
                    MyScholarHack uses your real stories, achievements, and
                    writing voice to help you create authentic scholarship
                    essays that win. No made-up experiences. No generic AI
                    fluff. Just your unique story, told powerfully.
                  </p>
                  <div className="pt-10 px-10 lg:px-0 flex flex-col md:flex-row gap-4 justify-center w-full">
                    <PrimaryBtn
                      hendleClick={() => router.push("/pricing")}
                      title={"Start Free Trial"}
                      icon={"line-md:arrow-right"}
                      style={"rounded-full"}
                    />
                    <SecoundryBtn
                      hendleClick={() => router.push("/how-to-work")}
                      title={"How it Works"}
                      icon={"line-md:arrow-right"}
                      style={"rounded-full"}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full h-[184px] md:h-[367px] lg:h-[547px] bg-[#FFCA42] rounded-t-2xl absolute">
                <Image
                  className="w-full h-full object-cover object-top px-2 pt-2 rounded-t-2xl"
                  src={"/Dashboard.svg"}
                  width={1000}
                  height={550}
                  alt="My Scholar Hack Dashboard"
                />
              </div>
            </div>
          )}
          {Pathname === "/about" && (
            <>
              <div className="w-full flex items-center justify-center">
                <div className="pt-10 pb-14 flex flex-col items-center w-full max-w-[1063px] justify-center px-4 md:px-0">
                  <div className="flex justify-center">
                    <Title title={"About Us"} />
                  </div>
                  <h1 className="w-full max-w-[765px] font-semibold text-3xl md:text-5xl lg:text-[64px] text-white text-center py-4">
                    Scholarships Don’t Have to Feel Overwhelming.
                  </h1>
                  <div className="w-full max-w-[765px] mx-auto text-left text-white/70 text-base md:text-xl">
                    <p className="font-bold">
                      Organize everything once. Create stronger essays faster.
                      Apply with confidence.
                    </p>
                    <p className="font-thin py-2">
                      MyScholarHack helps families stay on top of deadlines,
                      reuse stories strategically, and generate structured first
                      drafts built on real experiences — so students spend less
                      time starting from scratch and more time strengthening
                      what matters.
                    </p>
                    <p className="font-semibold pb-2">
                      No chaos.
                      <br /> No robotic essays.
                      <br />
                      No missed opportunities.
                      <br />
                    </p>
                    <p> Private by design • Cancel anytime • Parent-approved</p>
                  </div>

                  <div className="w-full max-w-[1240px] h-auto md:h-[569px] mt-9">
                    <Image
                      className="w-full h-full object-cover object-center rounded-2xl"
                      src={"/AboutBanner1.jpeg"}
                      width={1020}
                      height={330}
                      alt="My Scholar Hack Dashboard"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          {Pathname === "/feature" && (
            <>
              <div className="w-full flex items-center justify-center">
                <div className="pt-6 pb-14 flex flex-col items-center w-full max-w-[1063px] justify-center px-4 md:px-0">
                  <div className="flex justify-center">
                    <Title title={"Features"} />
                  </div>
                  <h1 className="font-semibold text-3xl md:text-5xl lg:text-[64px] text-white text-center py-4">
                    The only all-in-one scholarship system that organizes
                    everything and creates first-draft essays in your student’s
                    voice.
                  </h1>
                  <p className="mx-auto text-center text-white/70 text-base md:text-xl">
                    Most scholarship tools treat students like templates. They
                    don’t know their experiences, their goals, or their story.
                    MyScholarHack is different. We organize who your student
                    is—activities, interests, and experiences—so creating strong
                    first-draft essays feels natural, personal, and easy to
                    refine.
                  </p>
                </div>
              </div>
            </>
          )}
          {Pathname === "/pricing" && (
            <>
              <div className="w-full flex items-center justify-center">
                <div className="pt-20 pb-14 flex flex-col items-center w-full max-w-[1063px] justify-center px-4 md:px-0">
                  <div className="flex justify-center">
                    <Title title={"Pricing"} />
                  </div>
                  <h1 className="font-semibold text-3xl md:text-5xl lg:text-[64px] text-white text-center py-4">
                    Affordable Plans That Pay for Themselves
                  </h1>
                  <p className="mx-auto text-center text-white/70 text-base md:text-xl">
                    One scholarship win covers months of MyScholarHack. Invest
                    in your future.
                  </p>
                </div>
              </div>
            </>
          )}
          {Pathname === "/how-to-work" && (
            <>
              <div className="w-full flex items-center justify-center">
                <div className="pt-20 pb-14 flex flex-col items-center w-full max-w-[1063px] justify-center px-4 md:px-0">
                  <div className="flex justify-center">
                    <Title title={"How It Works"} />
                  </div>
                  <h1 className="font-semibold text-3xl md:text-5xl lg:text-[64px] text-white text-center py-4">
                    From Blank Page to Winning Essay in 4 Simple Steps
                  </h1>
                  <p className="mx-auto text-center text-white/70 text-base md:text-xl">
                    MyScholarHack guides you through the entire scholarship
                    essay process. No more staring at blank screens or wondering
                    what to write. Here's exactly how it works.
                  </p>
                </div>
              </div>
            </>
          )}
          {Pathname === "/faq" && (
            <>
              <div className="w-full flex items-center justify-center">
                <div className="pt-20 pb-14 flex flex-col items-center w-full max-w-[1063px] justify-center px-4 md:px-0">
                  <div className="flex justify-center">
                    <Title title={"FAQs"} />
                  </div>
                  <h1 className="font-semibold text-3xl md:text-5xl lg:text-[64px] text-white text-center py-4">
                    No More Blank Screens. No More Guessing.
                  </h1>
                  <p className="mx-auto text-center text-white/70 text-base md:text-xl">
                    Just a clear, guided path from first draft to final
                    submission. <br /> Here’s how MyScholarHack makes it simple:
                  </p>
                </div>
              </div>
            </>
          )}
        </Container>
      </HeaderBG>
    );
  }
}
