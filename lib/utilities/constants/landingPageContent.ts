import {
  Palette,
  Rocket,
  Handshake,
  Smartphone,
  Target,
  Briefcase,
  Users,
  type LucideIcon,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────

export interface FeatureItem {
  text: string;
  comingSoon: boolean;
  note?: string;
}

export interface FeatureCategory {
  name: string;
  comingSoon?: boolean;
  note?: string;
  items: FeatureItem[];
}

export interface ValuePropItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface AudienceSegment {
  segment: string;
  headline: string;
  description: string;
  perfectFor: string[];
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface PricingFeature {
  text: string;
  comingSoon: boolean;
  note?: string;
}

export interface PricingTier {
  name: string;
  price: number | string;
  billingPeriod: "month" | null;
  tagline: string;
  mostPopular: boolean;
  features: PricingFeature[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CtaButton {
  icon: LucideIcon;
  text: string;
}

// ─── Content ─────────────────────────────────────────────────────────────

export const hero = {
  headline: "Build Your Portfolio… Like A Pro.",
  subheadline:
    "Transform your career achievements into stunning, interactive portfolios that open doors to new opportunities. Tell your story the way it deserves to be told.",
  cta: "Start Building Your Portfolio - Free",
};

export const valueProposition: { title: string; items: ValuePropItem[] } = {
  title: "Why Portfolio Pro?",
  items: [
    {
      icon: Palette,
      title: "Beautiful, Professional Design",
      description:
        "Create stunning portfolios with our modern, customizable templates. No design skills required — just add your content and watch it come to life.",
    },
    {
      icon: Rocket,
      title: "Built for Success",
      description:
        "Showcase projects, skills, certifications, and testimonials in one cohesive platform designed to impress employers, clients, and collaborators.",
    },
    {
      icon: Handshake,
      title: "Collaborative Excellence",
      description:
        "Work seamlessly with team members on projects, gather testimonials, and build your professional network within the platform.",
    },
    {
      icon: Smartphone,
      title: "Always Accessible",
      description:
        "Your portfolio looks perfect on every device. Share a single link and let your work speak for itself, anywhere, anytime.",
    },
  ],
};

export const features: { title: string; categories: FeatureCategory[] } = {
  title: "Core Features That Set You Apart",
  categories: [
    {
      name: "Smart Portfolio Builder",
      items: [
        {
          text: "Drag-and-drop interface for effortless customization",
          comingSoon: false,
        },
        { text: "Multiple portfolio themes and layouts", comingSoon: false },
        {
          text: "Custom sections for unique professional stories",
          comingSoon: false,
        },
        { text: "Real-time preview and editing", comingSoon: false },
      ],
    },
    {
      name: "Project Showcase Excellence",
      items: [
        { text: "Rich media galleries for visual impact", comingSoon: true },
        { text: "Collaborative project management", comingSoon: false },
        { text: "Progress tracking and completion status", comingSoon: false },
        {
          text: "Categories and tags for easy organization",
          comingSoon: false,
        },
      ],
    },
    {
      name: "Professional Networking",
      items: [
        {
          text: "Collect and display authentic testimonials",
          comingSoon: false,
        },
        { text: "Connect with other professionals", comingSoon: false },
        {
          text: "Project collaboration and role attribution",
          comingSoon: false,
        },
        { text: "Social media integration", comingSoon: false },
      ],
    },
    {
      name: "Advanced Customization",
      items: [
        { text: "Custom themes with brand colors", comingSoon: false },
        { text: "Flexible content blocks and sections", comingSoon: false },
        {
          text: "SEO-optimized portfolio URLs",
          comingSoon: true,
          note: "Professional plan and above",
        },
        { text: "Professional domain integration", comingSoon: false },
      ],
    },
    {
      name: "Analytics & Insights",
      comingSoon: true,
      note: "Professional plan and above",
      items: [
        { text: "Track portfolio views and engagement", comingSoon: true },
        { text: "Monitor project popularity", comingSoon: true },
        { text: "Audience demographics and behavior", comingSoon: true },
        { text: "Performance optimization suggestions", comingSoon: true },
      ],
    },
  ],
};

export const targetAudience: AudienceSegment[] = [
  {
    segment: "Creative Professionals",
    headline: "Showcase Your Creative Vision",
    description:
      "Transform your artistic journey into an immersive digital experience. Whether you're a designer, photographer, writer, or artist, Portfolio Pro gives you the tools to present your work with the sophistication it deserves.",
    perfectFor: [
      "Graphic Designers",
      "Photographers",
      "Writers",
      "Artists",
      "Video Creators",
    ],
  },
  {
    segment: "Tech Professionals",
    headline: "Code Your Career Story",
    description:
      "Display your technical expertise with interactive project showcases and skill progression tracking. Show potential employers not just what you've built, but how you think and solve problems.",
    perfectFor: [
      "Software Developers",
      "Data Scientists",
      "UX/UI Designers",
      "DevOps Engineers",
    ],
  },
  {
    segment: "Business Professionals",
    headline: "Build Authority in Your Industry",
    description:
      "Establish thought leadership with case studies, client testimonials, and professional achievements. Create a comprehensive professional presence that builds trust and credibility with clients and employers.",
    perfectFor: [
      "Consultants",
      "Project Managers",
      "Marketing Professionals",
      "Sales Leaders",
    ],
  },
  {
    segment: "Students & Graduates",
    headline: "Launch Your Career with Confidence",
    description:
      "Stand out in competitive job markets with portfolios that highlight your academic projects, internships, and growing skill set. Start building your professional brand before you even graduate.",
    perfectFor: [
      "Students",
      "Recent Graduates",
      "Career Changers",
      "Freelancers",
    ],
  },
];

export const socialProof = {
  title: "Built for Professionals Who Want to Stand Out",
  description:
    "We're just getting started — and we're building Portfolio Pro around what real professionals need: a place to showcase work, gather genuine recommendations, and present a career story that opens doors.",
  isPlaceholder: true,
  placeholderNote:
    "Replace with real testimonials, quantified results, and verified usage stats once available. Avoid publishing invented quotes or numbers — for US audiences in particular, unverified statistics and fabricated testimonials on a commercial site can raise FTC deceptive-advertising concerns.",
};

export const howItWorks: { title: string; steps: HowItWorksStep[] } = {
  title: "Get Started in Minutes",
  steps: [
    {
      step: 1,
      title: "Create Your Foundation",
      description:
        "Sign up and complete your professional profile with skills, experience, and certifications. Our smart suggestions help you highlight your strongest assets.",
    },
    {
      step: 2,
      title: "Add Your Best Work",
      description:
        "Upload projects with rich descriptions, images, and collaboration details. Tag teammates, add completion status, and organize by category.",
    },
    {
      step: 3,
      title: "Customize Your Presence",
      description:
        "Choose from professional themes or create custom designs that reflect your personal brand. Arrange sections to tell your unique story.",
    },
    {
      step: 4,
      title: "Gather Social Proof",
      description:
        "Invite colleagues and clients to leave testimonials. Our guided process makes it easy for others to provide meaningful recommendations.",
    },
    {
      step: 5,
      title: "Share and Succeed",
      description:
        "Get your custom portfolio URL and start sharing. Track engagement, optimize based on analytics, and watch opportunities come to you.",
    },
  ],
};

export const pricing: { title: string; tiers: PricingTier[] } = {
  title: "Choose Your Portfolio Journey",
  tiers: [
    {
      name: "Starter",
      price: "Free",
      billingPeriod: null,
      tagline: "Perfect for students and emerging professionals",
      mostPopular: false,
      features: [
        { text: "Default portfolio (profile)", comingSoon: false },
        { text: "Basic themes", comingSoon: false },
        {
          text: "Unlimited projects, project engagement, and collaborations",
          comingSoon: false,
        },
        {
          text: "Instant, updated professional CV generation",
          comingSoon: false,
        },
        { text: "Testimonial support", comingSoon: false },
        {
          text: "Content engagement",
          comingSoon: false,
          note: "Analytics coming soon",
        },
      ],
    },
    {
      name: "Professional",
      price: 12,
      billingPeriod: "month",
      tagline: "Ideal for established professionals",
      mostPopular: true,
      features: [
        { text: "1 custom portfolio", comingSoon: false },
        { text: "Unlimited projects and collaboration", comingSoon: false },
        { text: "Premium themes", comingSoon: false },
        {
          text: "Premium custom portfolio background options, including 3D animations",
          comingSoon: false,
        },
        {
          text: "Instant, updated professional CV generation from profile and portfolio",
          comingSoon: false,
        },
        { text: "Testimonial support", comingSoon: false },
        { text: "Content engagement and analytics", comingSoon: true },
        { text: "SEO-optimized portfolio URLs", comingSoon: true },
      ],
    },
    {
      name: "Premium",
      price: 25,
      billingPeriod: "month",
      tagline: "Built for power users who need more than one portfolio",
      mostPopular: false,
      features: [
        { text: "Everything in Professional", comingSoon: false },
        { text: "Unlimited portfolios", comingSoon: false },
        {
          text: "Instant, updated professional CV generation from profile and each portfolio",
          comingSoon: false,
        },
        { text: "Custom domain", comingSoon: false },
        { text: "SEO-optimized portfolio URLs", comingSoon: true },
      ],
    },
    {
      name: "Enterprise",
      price: "Custom Pricing",
      billingPeriod: null,
      tagline:
        "Built for agencies and teams managing multiple clients or brands",
      mostPopular: false,
      features: [
        { text: "Everything in Premium", comingSoon: false },
        { text: "Custom, multi-page portfolio websites", comingSoon: false },
        {
          text: "Multiple custom domains across team/client portfolios",
          comingSoon: false,
        },
        { text: "Team seats with role-based permissions", comingSoon: false },
        {
          text: "Dedicated onboarding and priority support",
          comingSoon: false,
        },
        {
          text: "Contact sales for a quote based on team size",
          comingSoon: false,
        },
      ],
    },
  ],
};

export const faq: FaqItem[] = [
  {
    question: "Do I need design skills to create a professional portfolio?",
    answer:
      "Not at all! Portfolio Pro is designed for professionals of all backgrounds. Our intuitive interface and professional templates do the heavy lifting, so you can focus on showcasing your work.",
  },
  {
    question: "Can I collaborate with team members on projects?",
    answer:
      "Absolutely. You can invite team members to projects, assign roles, and showcase collaborative work with proper attribution. It's perfect for highlighting teamwork and leadership.",
  },
  {
    question: "How do I collect testimonials from clients or colleagues?",
    answer:
      "Portfolio Pro includes a built-in testimonial system. Simply send invitation links to your contacts, and they can easily provide recommendations that integrate seamlessly into your portfolio.",
  },
  {
    question: "Can I use my own domain name?",
    answer:
      "Yes! Premium and Enterprise plans include custom domain support, so you can use your own branded URL for maximum professional impact.",
  },
  {
    question: "Is my portfolio mobile-friendly?",
    answer:
      "Every Portfolio Pro template is fully responsive and optimized for mobile devices. Your portfolio will look stunning on phones, tablets, and desktops.",
  },
];

export const finalCta: {
  title: string;
  description: string;
  buttons: CtaButton[];
} = {
  title: "Ready to Transform Your Professional Presence?",
  description: "Start building your success story today.",
  buttons: [
    { icon: Target, text: "Start Your Free Portfolio" },
    { icon: Briefcase, text: "Explore Professional Features" },
    { icon: Users, text: "See How It Works" },
  ],
};

export const contact = {
  support: "support@portfoliopro.com",
  sales: "sales@portfoliopro.com",
};

export const tagline = "Portfolio Pro - Where Professionals Shine";

// ─── Convenience default export ─────────────────────────────────────────

const landingPageContent = {
  hero,
  valueProposition,
  features,
  targetAudience,
  socialProof,
  howItWorks,
  pricing,
  faq,
  finalCta,
  contact,
  tagline,
};

export default landingPageContent;
