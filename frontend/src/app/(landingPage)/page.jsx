"use client";

import Container from "@/components/landing/Container";
import SectionHead from "@/components/landing/SectionHead";
import PrimaryBtn from "@/components/landing/PrimaryBtn";
import ProblemPoint from "@/components/landing/ProblemPoint";
import SolutionSteps from "@/components/landing/SolutionSteps";
import FeatureCard from "@/components/landing/FeaturesCard";
import ReviewScroll from "@/components/landing/ReviewScroll";
import PricingSection from "@/components/landing/pricings/PricingSection";
import SecurityCard from "@/components/landing/securityCard";
import HeroCTA from "@/components/landing/HeroCTA";
import { useRouter } from "next/navigation";
import { getUserData, hasActivePlan } from "@/lib/auth";


export default function Home() {
  const router = useRouter();

  console.log(getUserData())
  console.log(hasActivePlan())
  return (
    <>
      <Container>
        {/* Describe Problem */}
        <section className="pt-20 lg:pt-[120px] pb-10 lg:pb-[72px] flex flex-col items-center justify-center gap-y-10 lg:gap-y-[60px]">
          <SectionHead
            Status={"Problem"}
            statusStyle={"text-[#D50000] border-[#D50000] "}
            title={"Scholarship Essays Shouldn't Feel Impossible"}
            description={"Create authentic essays using your voice-matched AI."}
          />

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-x-[72px] ">
            <ProblemPoint
              icon={"streamline-ultimate:science-molecule"}
              anim={"group-hover:animate-spin"}
              title={"The Struggle"}
              description={
                "You're staring at a blank page. The deadline is approaching. You know you have great stories to tell, but the words won't come. Sound familiar?"
              }
            />
            <ProblemPoint
              icon={"hugeicons:ai-idea"}
              anim={"group-hover:animate-bounce"}
              title={"The Generic Solution"}
              description={
                "Other AI tools just generate generic essays that sound like everyone else's. Scholarship reviewers can spot them a mile away—and so can AI detectors."
              }
            />
            <ProblemPoint
              icon={"fluent-mdl2:time-entry"}
              anim={"group-hover:animate-bounce"}
              title={"The Time Crunch"}
              description={
                "You want to apply to 20+ scholarships, but writing unique essays for each one takes hours. Who has that kind of time?"
              }
            />
          </div>
        </section>

        {/* Describe Solutions */}
        <section className="pt-20 lg:pt-[120px] pb-10 lg:pb-[72px] flex flex-col items-center justify-center gap-y-10 lg:gap-y-[60px]">
          <SectionHead
            Status={"Solution"}
            statusStyle={"text-[#0D8E55] border-[#0D8E55] "}
            title={"Your Stories. Your Voice. Your Success"}
            description={
              "MyScholarHack is different. We help you tell your authentic story by learning who you really are."
            }
          />

          <SolutionSteps
            icon={"uil:user"}
            title={"Build your Profile"}
            descrtion={
              "Upload your resume, transcripts, recommendation letters, and even a writing sample. We learn your voice, your achievements, and your unique experiences."
            }
            step={1}
          />
          <SolutionSteps
            icon={"gis:map-user"}
            title={"Find your Story"}
            descrtion={
              "Our AI guides you through discovering which of your experiences best match each scholarship prompt. No inventing stories—just highlighting what makes you special."
            }
            step={2}
          />
          <SolutionSteps
            icon={"hugeicons:note-02"}
            title={"Generate Your Essay"}
            descrtion={
              "Get a personalized first draft written in YOUR voice, based on YOUR real achievements. Edit and refine until it's perfect. Or, if you already have an idea but just need help to get it on paper and MyScholarHack will help you think through your first draft versus writing it for you"
            }
            step={3}
          />
          <SolutionSteps
            icon={"carbon:tropical-storm-tracks"}
            title={"Track Everything"}
            descrtion={
              "Keep all your applications organized in one place. Never miss a deadline. See what's working."
            }
            step={4}
          />

          <PrimaryBtn
            hendleClick={() => router.push("/signin")}
            icon={"ri:arrow-right-line"}
            title={"Start Writing Authentic Essays Today"}
            style={"rounded-full"}
          />
        </section>

        {/* Features */}
        <section className="pt-20 lg:pt-[120px] pb-10 lg:pb-[72px] flex flex-col items-center justify-center gap-y-10 lg:gap-y-[60px]">
          <SectionHead
            Status={"Feature"}
            statusStyle={"text-[#0D8E55] border-[#0D8E55] "}
            title={"Your Stories. Your Voice. Your Success"}
            description={
              "MyScholarHack is different. We help you tell your authentic story by learning who you really are."
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={"fa6-solid:microphone-lines"}
              title={"Voice Matching Technology"}
              descritption={
                "Upload a writing sample and we'll match your unique voice and style. Your essays will sound like you wrote them—because the ideas are all yours"
              }
              style={"bg-[#B46DFF]"}
            />
            <FeatureCard
              icon={"solar:user-id-outline"}
              title={"Smart Profile System"}
              descritption={
                "Store your resume, transcripts, letters, and achievements once. We'll pull the right details for each scholarship automatically."
              }
              style={"bg-[#1D9B86]"}
            />
            <FeatureCard
              icon={"healthicons:i-note-action-outline"}
              title={"Story Discovery Engine"}
              descritption={
                "Our Essay Comparison Engine analyzes multiple drafts to highlight differences in tone, structure, and clarity. \n It helps students refine strategically — so every revision moves the essay closer to submission-ready strength."
              }
              style={"bg-[#FC9550]"}
            />
            <FeatureCard
              icon={"healthicons:i-note-action-outline"}
              title={"Authentic Content Only"}
              descritption={
                "Every essay is built from your student’s real experiences — nothing fabricated, copied, or generic.\n We help refine and structure their story, not replace it."
              }
              style={"bg-[#3CA7E9]"}
            />
            <FeatureCard
              icon={"healthicons:i-note-action-outline"}
              title={"Application Tracking"}
              descritption={
                "Keep every scholarship, deadline, requirement, and status update in one organized dashboard. No more missed due dates or scattered spreadsheets — just clear, structured execution from start to submission."
              }
              style={"bg-[#00A5BB]"}
            />
            <FeatureCard
              icon={"fluent-mdl2:date-time-12"}
              title={"Unlimited Iterations"}
              descritption={
                "Refine your essay as many times as needed without worrying about limits or extra fees. Adjust tone, strengthen impact, and polish details until the final version truly reflects your student’s best work."
              }
              style={"bg-[#FC64CE]"}
            />
          </div>
        </section>

        {/* Reviews */}
        <section className="pt-20 lg:pt-[120px] pb-10 lg:pb-[72px] flex flex-col items-center justify-center gap-y-10 lg:gap-y-[60px]">
          <SectionHead
            Status={"Testimonial"}
            statusStyle={"text-[#FFB834] border-[#FFB834] "}
            title={"Real Students. Real Wins. Real Stories"}
            description={
              "Proof that genuine, voice-matched essays make a real difference."
            }
          />

          <ReviewScroll />
        </section>
      </Container>


      <PricingSection />

      <Container>
        <section className="pt-20 lg:pt-[120px] pb-10 lg:pb-[72px] flex flex-col items-center justify-center gap-y-10 lg:gap-y-[60px]">
          <SectionHead
            Status={"Security"}
            statusStyle={"text-[#D50000] border-[#D50000] "}
            title={"Your Data Is Safe With Us"}
            description={
              "Designed with student privacy in mind. Secure. Reliable. Confidential."
            }
          />

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ">
            <SecurityCard
              icon={"streamline-plump:desktop-lock-remix"}
              title={"Bank-Level Security"}
              description={
                "Your documents are encrypted and stored securely. We never share or sell your information."
              }
            />
            <SecurityCard
              icon={"streamline-plump:graduation-cap"}
              title={"FERPA Compliant"}
              description={
                "We follow strict educational privacy standards to protect student data."
              }
            />
            <SecurityCard
              icon={"streamline-plump:graduation-cap"}
              title={"You're In Control"}
              description={
                "Delete your data anytime. We don't keep anything you don't want us to."
              }
            />
          </div>
        </section>

        <HeroCTA />
      </Container>
    </>
  );
}
