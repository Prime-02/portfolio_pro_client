import { IconType } from "react-icons";
import {
  FaPortrait,
  FaProjectDiagram,
  FaFileAlt,
  FaCertificate,
} from "react-icons/fa";
import {
  FiBook,
  FiAward,
  FiImage,
  FiMessageSquare,
  FiGrid,
  FiShare2,
} from "react-icons/fi";
import { MdWork, MdSchool } from "react-icons/md";
import { GiSkills } from "react-icons/gi";

interface Route {
  slug: string;
  link: string;
  name: string;
  icon: IconType; // or React.ReactNode if you want to use JSX elements directly
}

export const landingPageNavItems = [
  {
    slug: "portfolios",
    link: "/portfolios",
    name: "Portfolios",
  },
  {
    slug: "projects",
    link: "/projects",
    name: "Projects",
  },
  {
    slug: "features",
    link: "/features",
    name: "Features",
  },
  {
    slug: "pricing",
    link: "/pricing",
    name: "Pricing",
  },
];

export const privateRoutes: Route[] = [
  {
    slug: "portfolios",
    link: "/portfolios",
    name: "Portfolio",
    icon: FaPortrait,
  },
  {
    slug: "projects",
    link: "/projects",
    name: "Projects",
    icon: FaProjectDiagram,
  },
  {
    slug: "resume",
    link: "/resume",
    name: "Resume",
    icon: FaFileAlt,
  },
  {
    slug: "certification",
    link: "/certification",
    name: "Certification",
    icon: FaCertificate,
  },
  {
    slug: "education",
    link: "/education",
    name: "Education",
    icon: MdSchool,
  },
  {
    slug: "skills",
    link: "/skills",
    name: "Skills",
    icon: GiSkills,
  },
  {
    slug: "media-gallery",
    link: "/media-gallery",
    name: "Media Gallery",
    icon: FiImage,
  },
  {
    slug: "testimonials",
    link: "/testimonials",
    name: "Testimonials",
    icon: FiMessageSquare,
  },
  {
    slug: "content-block",
    link: "/content-block",
    name: "Content Block",
    icon: FiGrid,
  },
  {
    slug: "socials",
    link: "/socials",
    name: "Socials",
    icon: FiShare2,
  },
];
