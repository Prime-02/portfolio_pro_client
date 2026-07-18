import { IconType } from "react-icons";
import {
  FaProjectDiagram,
  FaFileAlt,
  FaCertificate,
  FaIdCard,
  FaCog,
  FaBriefcase,
  FaCreditCard,
} from "react-icons/fa";
import {
  FiMessageSquare,
  FiGrid,
  FiShare2,
  FiClock,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { GiSkills } from "react-icons/gi";
import { IoAnalytics, IoSettingsSharp } from "react-icons/io5";

interface Route {
  slug: string;
  link: string;
  name: string;
  description: string;
  icon: IconType;
}

export const unprotectedRoutes = [
  "/user-auth",
  "/register",
  "/auth",
  "/public",
  "/feed",
  "/blogs",
  "/projects",
  "/test-endpoints",
  "/install-app",
  "/subscription",
];

export const privateRoutes: Route[] = [
  {
    name: "Personal Profile",
    link: "",
    slug: "personal-info",
    icon: FaIdCard,
    description: "View and manage your personal profile information",
  },
  {
    slug: "preference",
    link: "/settings/preference",
    name: "Preference",
    icon: FaCog,
    description: "Customize your theme preferences and loading settings",
  },
  {
    slug: "portfolios",
    link: "/portfolios",
    name: "Portfolio Cluster",
    icon: FaBriefcase,
    description: "Manage and showcase your professional portfolio items",
  },
  {
    slug: "experience",
    link: "/experience",
    name: "Experience",
    icon: FiClock,
    description: "Manage your work experience and employment history",
  },
  {
    slug: "projects",
    link: "/projects",
    name: "Projects",
    icon: FaProjectDiagram,
    description: "Add and organize your completed and ongoing projects",
  },
  {
    slug: "resume",
    link: "/cv",
    name: "Professional CV",
    icon: FaFileAlt,
    description:
      "Generate professional CV from your profile data or existing portfolios",
  },
  {
    slug: "certification",
    link: "/certification",
    name: "Certification",
    icon: FaCertificate,
    description: "Track and display your professional certifications",
  },
  {
    slug: "education",
    link: "/education",
    name: "Education",
    icon: MdSchool,
    description: "Manage your educational background and qualifications",
  },
  {
    slug: "skills",
    link: "/skills",
    name: "Skills",
    icon: GiSkills,
    description: "Add and organize your professional skills and competencies",
  },
  {
    slug: "testimonials",
    link: "/testimonials",
    name: "Testimonials",
    icon: FiMessageSquare,
    description: "Manage client and colleague testimonials and reviews",
  },
  {
    slug: "blogs",
    link: "/blogs",
    name: "Posts & Blogs",
    icon: FiGrid,
    description: "Create and organize custom content sections for your profile",
  },
  {
    slug: "socials",
    link: "/socials",
    name: "Socials",
    icon: FiShare2,
    description: "Manage your social media links and online presence",
  },
  {
    slug: "account-settings",
    link: "/settings/account",
    name: "Account Settings",
    icon: IoSettingsSharp,
    description:
      "Manage your account security, password, and personal settings",
  },
  {
    slug: "session-management",
    link: "/settings/sessions",
    name: "Session Management",
    icon: FiActivity,
    description: "View and manage your active login sessions and devices",
  },
  {
    slug: "analytics",
    link: "/analytics",
    name: "Analytics",
    icon: IoAnalytics,
    description:
      "View detailed analytics and insights for your profile and content performance",
  },
  {
    slug: "subscription",
    link: "/billing",
    name: "Subscription",
    icon: FaCreditCard,
    description: "Manage your subscription plan and billing information",
  },
  {
    slug: "usage",
    link: "/billing/usage",
    name: "Usage",
    icon: FiBarChart2,
    description: "Monitor your resource usage and consumption metrics",
  },
];
