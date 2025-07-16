import Container from "@/components/landing/Container";
import WorkingSteps from "@/components/landing/WorkingSteps";

export default function Howtowork() {
  const steps = [
    {
      number: 1,
      title: "Build Your Profile (One-Time Setup)",
      description:
        "Create your comprehensive profile by uploading key documents and filling out your background information.",
      columns: [
        {
          heading: "Upload These Documents:",
          items: [
            "Resume or CV",
            "High school/college transcripts",
            "Letters of recommendation",
            "A writing sample (essay, blog post, personal statement)",
            "Any awards or certificates",
          ],
        },
        {
          heading: "Tell Us About:",
          items: [
            "Your academic background/GPA, major, honors",
            "Extracurricular activities",
            "Volunteer work and community service",
            "Work experience",
            "Personal challenges you've overcome",
            "Hobbies and aspirations",
            "What makes you unique",
          ],
        },
      ],
      timeInvestment: "30-45 minutes (one time only)",
      whyItMatters: [
        "Why This Matters: This comprehensive profile becomes the foundation for every essay you write. The more detail you provide, the more personalized and authentic your essays will be.",
      ],
    },
    {
      number: 2,
      title: "Add a Scholarship",
      description:
        "Add scholarship details including organization, prompt, word or character count, etc.",
      columns: [
        {
          heading: "Input Required:",
          items: [
            "Scholarship name",
            "Deadline",
            "Award amount",
            "Scholarship provider/organization",
            "Essay prompt or question",
            "Word count requirement",
            "Any special requirements",
          ],
        },
        {
          heading: "Quick Add Options:",
          items: [
            "Paste the scholarship URL and we'll auto-fill most field",
            "Manually enter details",
            "Import from Scholarships.com, Fastweb, or College Board",
          ],
        },
      ],
      timeInvestment: "2-3 minutes per scholarship",
    },
    {
      number: 3,
      title: "Generate Your Essay",
      description:
        'Click "Generate Essay" and let our AI guide you through creating an authentic, personalized draft.',
      columns: [
        {
          heading: "The Process:",
          items: [
            "Story Discovery (5-10 questions)",
            "Experience Selection",
            "First Draft Generation",
            "Detail Addition",
            "Voice Tweaking",
          ],
        },
      ],
      timeInvestment: "10-15 minutes (including question answering)",
      whyItMatters: [
        "What You Get: A complete essay draft that sounds like you, tells your real story, and directly addresses the scholarship prompt.",
      ],
    },
    {
      number: 4,
      title: "Refine and Perfect",
      description:
        "Review your essay draft and refine it until it perfectly captures your story and voice.",
      columns: [
        {
          heading: "Refinement Options:",
          items: [
            "Tone Adjustment",
            "Flow Shift",
            "Length Change",
            "Detail Addition",
            "Voice Tweaking",
          ],
        },
        {
          heading: "AI-Assisted Editing:",
          items: [
            "Grammar and spelling checks",
            "Flow improvements",
            "Clarity enhancements",
            "Redundancy removal",
          ],
        },
      ],
      additionalInfo: [
        {
          label: "Manual Editing",
          text: "Edit the essay directly in our built-in editor. AI-dropped, formatting tools included.",
        },
        {
          label: "Unlimited Revisions",
          text: "5-30 minutes per essay (unlimited iterations)",
        },
      ],
      whyItMatters: [
        "A complete essay draft that sounds like you, tells your real story, and directly addresses the scholarship prompt.",
      ],
      highlightBox: {
        heading: "When You're Done:",
        items: [
          "Save to your dashboard",
          "Export as Word doc, PDF, or plain text",
          "Copy directly into scholarship application",
          "Track that you've completed the application",
        ],
      },
    },
    {
      number: 5,
      title: "Submit and Track",
      description: "",
      columns: [
        {
          heading: "What You’ll Do",
          items: [
            "Generate and refine your essay inside MyScholarHack until it feels strong, authentic, and aligned with the scholarship prompt.",
            "Paste the draft into Word, Google Docs, or your preferred editor to format it properly, double-check guidelines, and make any final personal tweaks.",
            "Submit your finalized essay directly to the scholarship organization.",
            "Come back and save your final version inside your dashboard — so it becomes part of your growing library of reusable stories.",
          ],
        },
      ],
      whyItMatters: [
        "Each completed essay strengthens your long-term strategy.",
        "Instead of starting over each time, you build momentum.",
        "Your work stays organized and reusable for future scholarships.",
      ],
    },
  ];

  return (
    <Container>
      <div className="py-22">
        {steps.map((step) => (
          <WorkingSteps key={step.number} {...step} />
        ))}
      </div>
    </Container>
  );
}
