import { IconType } from "react-icons";
import {
  FaProjectDiagram,
  FaFileAlt,
  FaCertificate,
  FaUser,
  FaIdCard,
  FaCog,
  FaBriefcase,
} from "react-icons/fa";
import {
  FiImage,
  FiMessageSquare,
  FiGrid,
  FiShare2,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { GiSkills } from "react-icons/gi";

interface Route {
  slug: string;
  link: string;
  name: string;
  description: string;
  icon: IconType; // or React.ReactNode if you want to use JSX elements directly
}

export const privateRoutes: Route[] = [
  {
    slug: "profile",
    link: "/profile/me",
    name: "Profile",
    icon: FaUser,
    description: "View and manage your personal profile information",
  },
  {
    name: "Personal Information",
    link: "/personal-info",
    slug: "personal-info",
    icon: FaIdCard,
    description: "Update your basic personal details and contact information",
  },
  {
    slug: "preference",
    link: "/themes-loaders",
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
    slug: "projects",
    link: "/projects",
    name: "Projects",
    icon: FaProjectDiagram,
    description: "Add and organize your completed and ongoing projects",
  },
  {
    slug: "resume",
    link: "/resume",
    name: "Resume",
    icon: FaFileAlt,
    description: "Upload and manage your professional resume/CV documents",
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
    slug: "media-gallery",
    link: "/media-gallery",
    name: "Media Gallery",
    icon: FiImage,
    description: "Upload and manage images and media for your profile",
  },
  {
    slug: "testimonials",
    link: "/testimonials",
    name: "Testimonials",
    icon: FiMessageSquare,
    description: "Manage client and colleague testimonials and reviews",
  },
  {
    slug: "content-block",
    link: "/content-block",
    name: "Content Block",
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
];
