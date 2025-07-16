import Container from "@/components/landing/Container";
import FeatureCard from "@/components/landing/FeatureCard";

export default function Feature() {
  const features = [
    {
      title: "Smart Profile System",
      description:
        "Build your student’s profile once — activities, leadership, service, achievements, and past writing — all in one place.",
      whyItMatters: [
        "The stronger the profile, the stronger every essay.",
        "One thoughtful setup saves hours later."
      ],
      imagePosition: "right",
      image: "/Smart-Profile-System.png"
    },
    {
      title: "Story Discovery Engine",
      description:
        "For each scholarship prompt, MyScholarHack identifies which real experiences best match what’s being asked.",
      whyItMatters: [
        "Students don’t struggle because they lack stories — they struggle because they don’t know which story fits.",
        "This removes second-guessing and builds confidence fast."
      ],
      imagePosition: "left",
      image: "/Story-Discovery-Engine.png"
    },
    {
      title: "Application Tracking Dashboard",
      description:
        "A central hub for every scholarship, deadline, requirement, and status update.",
      whyItMatters: [
        "Opportunities aren’t lost from lack of talent — they’re lost from overwhelm.",
        "Clear visibility keeps everything on track."
      ],
      imagePosition: "right",
      image: "/Application-Tracking-Dashboard.png"
    },
    {
      title: "Multiple Essay Management",
      description:
        "Reuse and adapt your strongest essays for similar scholarships — without rewriting from scratch.",
      whyItMatters: [
        "The real drain isn’t writing — it’s starting over.",
        "Work smarter. Apply more. Avoid burnout."
      ],
      imagePosition: "left",
      image: "/Multiple-Essay-Management.png"
    },
    {
      title: "Unlimited Refinement",
      description:
        "Revise and strengthen drafts as many times as needed — without deleting everything and beginning again.",
      whyItMatters: [
        "The best essays are refined, not rushed.",
        "Students build momentum instead of frustration.",
        "Better essays. Less stress. More confidence."
      ],
      imagePosition: "right",
      image: "/Unlimited-Refinement.png"
    },
    {
      title: "Built Around Proven Essay Structure",
      description:
        "Designed around proven storytelling and essay structure principles — clear introductions, compelling examples, focused conclusions.",
      whyItMatters: [
        "Students don’t just get paragraphs.",
        "They start with structure — then personalize it in their own voice."
      ],
      imagePosition: "left",
      image: "/Built-Around-Proven-Essay-Structure.png"
    },
    {
      title: "Private, Closed AI System",
      description:
        "Essays are generated inside a secure, closed system within your account.",
      whyItMatters: [
        "Nothing is shared, reused, or added to public AI databases.",
        "Their story belongs to them."
      ],
      imagePosition: "right",
      image: "/Private-Closed-AI-System.png"
    }
  ];

  return (
    <Container>
      <div className="py-16 space-y-24">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </Container>
  );
}
