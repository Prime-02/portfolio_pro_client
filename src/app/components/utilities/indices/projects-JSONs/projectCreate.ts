import { ProjectCreateFormData } from "@/app/components/types and interfaces/ProjectsAndPortfolios";

export const initialProjectFormData: ProjectCreateFormData = {
  // STEP 1: Basic Info
  project_name: "",
  project_description: "",
  project_platform: "portfolio-pro",
  project_media: null,
  project_category: "",

  // STEP 2: Technical & Timeline
  contribution: "",
  contribution_description: "",
  project_url: "",
  stack: [],
  other_project_url: [],
  tags: [],
  start_date: "",
  end_date: "",
  budget: 0,
  client_name: "",

  // STEP 3: Settings & Display
  is_concept: false,
  is_completed: false,
  is_public: true,
  status: "active",
  featured_in: [],
};

export const projectCategory = [
  {
    id: "web-development",
    code: "Web Development & Programming",
  },
  {
    id: "mobile-development",
    code: "Mobile App Development",
  },
  {
    id: "ui-ux-design",
    code: "UI/UX Design & User Experience",
  },
  {
    id: "desktop-development",
    code: "Desktop Software Development",
  },
  {
    id: "game-development",
    code: "Game Development & Interactive Media",
  },
  {
    id: "devops-cloud",
    code: "DevOps & Cloud Engineering",
  },
  {
    id: "data-science-ai-ml",
    code: "Data Science & AI/Machine Learning",
  },
  {
    id: "cybersecurity",
    code: "Cybersecurity & Information Security",
  },
  {
    id: "blockchain-web3",
    code: "Blockchain & Web3 Development",
  },
  {
    id: "api-integration",
    code: "API Development & Integration",
  },
  {
    id: "database-design",
    code: "Database Design & Management",
  },
  {
    id: "software-testing",
    code: "Software Testing & Quality Assurance",
  },
  {
    id: "motion-graphics",
    code: "Motion Graphics & Animation",
  },
  {
    id: "illustration-digital-art",
    code: "Illustration & Digital Art",
  },
  {
    id: "photography",
    code: "Photography & Photo Editing",
  },
  {
    id: "video-production",
    code: "Video Production & Post-Production",
  },
  {
    id: "3d-modeling-rendering",
    code: "3D Modeling & Rendering",
  },
  {
    id: "audio-production",
    code: "Audio Production & Sound Design",
  },
  {
    id: "graphic-design",
    code: "Graphic Design & Brand Identity",
  },
  {
    id: "web-design",
    code: "Web Design & Visual Communication",
  },
  {
    id: "print-design",
    code: "Print Design & Publishing",
  },
  {
    id: "character-design",
    code: "Character Design & Concept Art",
  },
  {
    id: "marketing-campaigns",
    code: "Marketing Campaigns & Strategy",
  },
  {
    id: "business-plans",
    code: "Business Plans & Strategic Planning",
  },
  {
    id: "market-research",
    code: "Market Research & Analysis",
  },
  {
    id: "e-commerce",
    code: "E-commerce & Online Business",
  },
  {
    id: "content-creation",
    code: "Content Creation & Social Media",
  },
  {
    id: "public-relations",
    code: "Public Relations & Communications",
  },
  {
    id: "seo-sem",
    code: "SEO & Search Engine Marketing",
  },
  {
    id: "influencer-marketing",
    code: "Influencer Marketing & Partnerships",
  },
  {
    id: "brand-strategy",
    code: "Brand Strategy & Development",
  },
  {
    id: "technical-writing",
    code: "Technical Writing & Documentation",
  },
  {
    id: "copywriting",
    code: "Copywriting & Marketing Content",
  },
  {
    id: "creative-writing",
    code: "Creative Writing & Storytelling",
  },
  {
    id: "journalism",
    code: "Journalism & Editorial Content",
  },
  {
    id: "grant-writing",
    code: "Grant & Proposal Writing",
  },
  {
    id: "translation-localization",
    code: "Translation & Localization",
  },
  {
    id: "script-writing",
    code: "Screenwriting & Script Development",
  },
  {
    id: "product-design-prototyping",
    code: "Product Design & Prototyping",
  },
  {
    id: "electronics-robotics",
    code: "Electronics & Robotics Engineering",
  },
  {
    id: "mechanical-projects",
    code: "Mechanical Engineering Projects",
  },
  {
    id: "civil-architecture",
    code: "Civil & Architectural Engineering",
  },
  {
    id: "renewable-energy",
    code: "Renewable Energy & Sustainability",
  },
  {
    id: "automotive-aerospace",
    code: "Automotive & Aerospace Engineering",
  },
  {
    id: "biomedical-engineering",
    code: "Biomedical & Healthcare Engineering",
  },
  {
    id: "scientific-research",
    code: "Scientific Research & Development",
  },
  {
    id: "academic-studies",
    code: "Academic Studies & Thesis Projects",
  },
  {
    id: "case-studies",
    code: "Case Studies & Business Analysis",
  },
  {
    id: "data-visualization",
    code: "Data Visualization & Analytics",
  },
  {
    id: "statistical-analysis",
    code: "Statistical Analysis & Modeling",
  },
  {
    id: "laboratory-research",
    code: "Laboratory Research & Experiments",
  },
  {
    id: "woodworking-carpentry",
    code: "Woodworking & Fine Carpentry",
  },
  {
    id: "metalworking-welding",
    code: "Metalworking & Fabrication",
  },
  {
    id: "textiles-fashion",
    code: "Fashion Design & Textile Arts",
  },
  {
    id: "ceramics-pottery",
    code: "Ceramics & Pottery Arts",
  },
  {
    id: "culinary-arts",
    code: "Culinary Arts & Gastronomy",
  },
  {
    id: "jewelry-making",
    code: "Jewelry Making & Metalsmithing",
  },
  {
    id: "home-renovation",
    code: "Home Renovation & Interior Design",
  },
  {
    id: "gardening-landscaping",
    code: "Gardening & Landscape Design",
  },
  {
    id: "course-creation",
    code: "Online Course Development",
  },
  {
    id: "lesson-plans",
    code: "Educational Materials & Curriculum",
  },
  {
    id: "workshops-tutorials",
    code: "Workshops & Training Programs",
  },
  {
    id: "e-learning-platforms",
    code: "E-Learning Platform Development",
  },
  {
    id: "language-learning",
    code: "Language Learning Resources",
  },
  {
    id: "skill-assessments",
    code: "Skills Assessment & Certification",
  },
  {
    id: "event-planning",
    code: "Event Planning & Management",
  },
  {
    id: "nonprofit-community",
    code: "Non-Profit & Community Initiatives",
  },
  {
    id: "performance-arts",
    code: "Performing Arts & Theatre",
  },
  {
    id: "sports-coaching",
    code: "Sports Coaching & Athletic Training",
  },
  {
    id: "health-wellness",
    code: "Health & Wellness Programs",
  },
  {
    id: "mental-health",
    code: "Mental Health & Therapy Resources",
  },
  {
    id: "music-production",
    code: "Music Production & Composition",
  },
  {
    id: "podcast-production",
    code: "Podcast Production & Audio Content",
  },
  {
    id: "financial-planning",
    code: "Financial Planning & Investment",
  },
  {
    id: "legal-consulting",
    code: "Legal Research & Consulting",
  },
  {
    id: "real-estate",
    code: "Real Estate Development & Management",
  },
  {
    id: "logistics-supply-chain",
    code: "Logistics & Supply Chain Management",
  },
  {
    id: "hr-recruitment",
    code: "Human Resources & Talent Acquisition",
  },
  {
    id: "project-management",
    code: "Project Management & Operations",
  },
  {
    id: "quality-assurance",
    code: "Quality Assurance & Process Improvement",
  },
  {
    id: "environmental-science",
    code: "Environmental Science & Conservation",
  },
  {
    id: "biotechnology",
    code: "Biotechnology & Life Sciences",
  },
  {
    id: "urban-planning",
    code: "Urban Planning & Smart Cities",
  },
  {
    id: "agriculture-tech",
    code: "Agricultural Technology & Innovation",
  },
  {
    id: "virtual-reality",
    code: "Virtual Reality & Immersive Experiences",
  },
  {
    id: "augmented-reality",
    code: "Augmented Reality & Mixed Reality",
  },
  {
    id: "iot-embedded",
    code: "IoT & Embedded Systems",
  },
  {
    id: "quantum-computing",
    code: "Quantum Computing & Advanced Computing",
  },
  {
    id: "space-technology",
    code: "Space Technology & Astronomy",
  },
];

export const gitHubLanguageColors: { [key: string]: string } = {
  JavaScript: "#f1e05a",
  TypeScript: "#2b7489",
  Python: "#3572A5",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#239120",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#ffac45",
  Kotlin: "#F18E33",
  Scala: "#c22d40",
  R: "#198CE7",
  MATLAB: "#e16737",
  Perl: "#0298c3",
  Shell: "#89e051",
  PowerShell: "#012456",
  Dart: "#00B4AB",
  Lua: "#000080",
  Haskell: "#5e5086",
  Clojure: "#db5855",
  Elixir: "#6e4a7e",
  Erlang: "#B83998",
  "F#": "#b845fc",
  OCaml: "#3be133",
  "Vim script": "#199f4b",
  "Emacs Lisp": "#c065db",
  Assembly: "#6E4C13",
  Makefile: "#427819",
  Dockerfile: "#384d54",
  HTML: "#e34c26",
  CSS: "#1572B6",
  SCSS: "#c6538c",
  Vue: "#2c3e50",
  Svelte: "#ff3e00",
  "Jupyter Notebook": "#DA5B0B",
  TeX: "#3D6117",
  YAML: "#cb171e",
  JSON: "#292929",
  XML: "#0060ac",
  Markdown: "#083fa1",
};

export const ConnectionPlatforms = [
  {
    platform: "Portfolio Pro",
    description:
      "Import projects manually on the platform by uploading images and details of the project",
    logoSrc: `/apple-touch-icon.png`,
    logoAlt: "Portfolio Pro Logo",
    platformKey: "portfolio-pro",
  },
  {
    platform: "Github",
    description: "Import repositories and track development projects",
    logoSrc: (hasTheme: boolean) =>
      `/socials/github/github-mark/github-mark${!hasTheme ? "" : "-white"}.png`,
    logoAlt: "GitHub Logo",
    platformKey: "github",
  },
  {
    platform: "Vercel",
    description: "Track deployments and frontend applications",
    logoSrc: (hasTheme: boolean) =>
      `/socials/vercel/vercel-icon-${hasTheme ? "dark" : "light"}.svg`,
    logoAlt: "Vercel Logo",
    platformKey: "vercel",
  },
  {
    platform: "Figma",
    description: "Sync design files and prototypes from your teams",
    logoSrc: "/socials/figma/Figma_Icon_15.png",
    logoAlt: "figma Logo",
    platformKey: "figma",
  },
  {
    platform: "Canva",
    description: "Import designs, presentations, and creative projects",
    logoSrc: "/socials/canva/Canva_Logo_0.svg",
    logoAlt: "LinkedIn Logo",
    platformKey: "canva",
  },
  {
    platform: "Notion",
    description: "Connect workspaces and documentation projects",
    logoSrc: (hasTheme: boolean) =>
      `/socials/notion/Notion_Symbol_${hasTheme ? "9" : "6"}.svg`,
    logoAlt: "LinkedIn Logo",
    platformKey: "notion",
  },
  {
    platform: "Dribble",
    description: "Showcase your design portfolio and creative work",
    logoSrc: (hasTheme: boolean) =>
      `/socials/dribbble/Dribbble_Symbol_${hasTheme ? "9" : "6"}.svg`,
    logoAlt: "LinkedIn Logo",
    platformKey: "dribble",
  },
  {
    platform: "Behance",
    description: "Import creative projects from your Behance portfolio",
    logoSrc: (hasTheme: boolean) =>
      `/socials/behance/Behance_Symbol_${hasTheme ? "9" : "6"}.svg`,
    logoAlt: "LinkedIn Logo",
    platformKey: "behance",
  },
  {
    platform: "Linear",
    description: "Track project management and development workflows",
    logoSrc: (hasTheme: boolean) =>
      `/socials/linear/Linear_Symbol_${hasTheme ? "9" : "6"}.svg`,
    logoAlt: "LinkedIn Logo",
    platformKey: "linear",
  },
  {
    platform: "GitLab",
    description: "Import repositories and CI/CD pipelines",
    logoSrc: "/socials/gitlab/GitLab_Symbol_12.svg",
    logoAlt: "LinkedIn Logo",
    platformKey: "gitlab",
  },
];

export const filterPlatform = (platformName: string) => {
  return ConnectionPlatforms.find(
    platform => platformName === platform.platformKey
  );
};