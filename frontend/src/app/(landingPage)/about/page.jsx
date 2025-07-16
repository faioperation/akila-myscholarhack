import Image from "next/image";
import Container from "@/components/landing/Container";
import SectionHead from "@/components/landing/SectionHead";
export default function AboutPage() {
  return (
    <div className=" lg:mt-[305px]">
      <Container>
        <div className="pt-34">
          <div>
            <h3 className="text-3xl font-semibold mb-2.5">About Us</h3>
            <p className="text-xl font-normal text-[#404040]">
              Applying for scholarships is one of the most overwhelming — and
              misunderstood — parts of the college process. Families are often
              left navigating vague prompts, tight deadlines, and high stakes
              with little guidance, while students struggle to translate who
              they are into clear, compelling writing — all while trying to stay
              authentic. We created this AI Scholarship Agent to change that
              experience.
              <br /> <br />
              Our work sits at the intersection of{" "}
              <strong>
                {" "}
                college planning, student development, and responsible
                technology
              </strong>
              . We believe students deserve tools that support their thinking,
              not replace it — tools that help them clarify their ideas,
              organize their experiences, and communicate in their own voice
              with confidence.This platform was built for students who want to
              do their own work — and for parents and educators who want
              ethical, transparent support that respects student voice and
              institutional values.No shortcuts. No guarantees. Just smart
              structure, clarity, and guidance.
            </p>
          </div>
          <div className="my-9">
            <h3 className="text-3xl font-semibold mb-2.5">Our Misson</h3>
            <p className="text-xl font-normal text-[#404040]">
              Our mission is to help students{" "}
              <strong>
                express their real stories clearly and confidently —
              </strong>{" "}
              while keeping the scholarship process ethical, student-led, and
              aligned with how colleges and institutions expect work to be done.
            </p>
          </div>

          <div className="space-y-10 lg:space-y-14">
            {/* We Believe Section */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold mb-6 lg:mb-8">
                We Believe:
              </h3>
              <ul className="space-y-3 lg:space-y-4 text-xl font-normal text-[#404040] list-none">
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>
                    Students should remain the{" "}
                    <strong>authors of their own words</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>
                    AI should act as a <strong>coach and guide</strong>, not a
                    replacement.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>
                    Scholarship writing should develop{" "}
                    <strong>
                      self-awareness, reflection, and communication skills
                    </strong>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>
                    Families deserve tools that <strong>reduce stress</strong>,
                    not increase pressure.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>
                    Educators and counselors should feel confident recommending
                    the resources students use.
                  </span>
                </li>
              </ul>
            </div>

            {/* That's why this platform is designed to Section */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold mb-6 lg:mb-8">
                That's why this platform is designed to:
              </h3>
              <ul className="space-y-3 lg:space-y-4 text-xl font-normal text-[#404040] list-none">
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>Preserve each student's unique voice.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>Encourage original thinking and reflection.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>
                    Support planning, drafting, and revision responsibly.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFCA42] mt-1.5">•</span>
                  <span>
                    Help families manage opportunities without overwhelm.
                  </span>
                </li>
              </ul>
            </div>

            {/* Concluding Statement */}
            <div className="pt-4 lg:pt-0">
              <p className="text-xl lg:text-2xl font-normal text-[#404040] leading-relaxed">
                Our goal isn't just better essays—it's a healthier, more
                thoughtful scholarship process that helps students grow while
                staying true to who they are.
              </p>
            </div>
          </div>

          <p className="text-xl font-normal text-[#404040] mt-5">
            Our goal isn’t just better essays — it’s a healthier, more
            thoughtful scholarship process that helps students grow while
            staying true to who they are.
          </p>
        </div>

        <section className="lg:pt-[90px] pb-10 lg:pb-[72px] flex flex-col items-center justify-center gap-y-10 lg:gap-y-[60px]">
          <SectionHead
            Status={"Teams"}
            statusStyle={"text-[#0D8E55] border-[#0D8E55] "}
            title={"Meet Your Big Sis in College Prep"}
            description={
              "I’m your ScholarHackSis who’s been through college prep with my three kids plus dozens of others. I’ve seen how many scholarships get missed—not because students aren’t qualified, but because the process is overwhelming. I built MyScholarHack to give you a simple system that actually works."
            }
          />

          <div>
            <div className="border border-[#C4C4C4] rounded-2xl flex flex-col justify-center items-center p-4">
              <div className="w-full max-w-[568px] h-auto aspect-square h md:h-[478px]">
                <Image
                  className="w-full h-full object-cover rounded-t-2xl"
                  src={"/founder.jpeg"}
                  width={500}
                  height={500}
                  alt="C.E.O of MyScholerHack"
                />
              </div>
              <div className="max-w-[568px]">
                <h3 className="text-3xl font-semibold mt-5 mb-2.5">
                  Akilah Collins
                </h3>
                <p className="text-xl font-medium my-3 text-[#404040]">
                  Meet Your Big Sis in College Prep
                </p>
                <p className="text-base text-[#404040]">
                  I’m your ScholarHackSis who’s been through college prep with my three kids plus dozens of others. I’ve seen how many scholarships get missed—not because students aren’t qualified, but because the process is overwhelming. I built MyScholarHack to give you a simple system that actually works.
                </p>
              </div>
            </div>
          </div>

          {/* <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 ">
            <div className="border border-[#C4C4C4] rounded-2xl flex flex-col justify-center items-center p-4">
              <div className="w-full max-w-[568px] h-auto aspect-square h md:h-[478px]">
                <Image
                  className="w-full h-full object-cover rounded-t-2xl"
                  src={"/founder.jpeg"}
                  width={500}
                  height={500}
                  alt="C.E.O of MyScholerHack"
                />
              </div>
              <div>
                <h3 className="text-3xl font-semibold mt-5 mb-2.5">
                  Henry, Arthur
                </h3>
                <p className="text-xl font-medium my-3 text-[#404040]">
                  Co-Founder & CEO, MyScholarHack
                </p>
                <p className="text-base text-[#404040]">
                  Built MyScholarHack after winning multiple merit scholarships;
                  leads product vision and student outreach.
                </p>
              </div>
            </div>

            <div className="border border-[#C4C4C4] rounded-2xl flex flex-col justify-center items-center p-4">
              <div className="w-full max-w-[568px] h-auto aspect-square md:h-[478px]">
                <Image
                  className="w-full h-full object-cover"
                  src={"/ctoProtile.png"}
                  width={500}
                  height={500}
                  alt="C T O of MyScholerHack"
                />
              </div>
              <div>
                <h3 className="text-3xl font-semibold mt-5 mb-2.5">
                  Flores, Juanita
                </h3>
                <p className="text-xl font-medium my-3 text-[#404040]">
                  Co-Founder & CTO, MyScholarHack
                </p>
                <p className="text-base text-[#404040]">
                  Built MyScholarHack after winning multiple merit scholarships;
                  leads product vision and student outreach.
                </p>
              </div>
            </div>
          </div> */}
        </section>
      </Container>
    </div>
  );
}
