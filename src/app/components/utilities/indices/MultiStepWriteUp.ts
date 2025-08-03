export const accountBasics = {
  step: 1,
  title: "Account Basics",
  description: "Provide your basic account information to set up your profile.",
  greeting:
    "Welcome to the first step of creating your professional portfolio!",
  page_writeup:
    "Here, you'll provide essential details like your username and name, which help personalize your account. We also need your consent to process your data and agree to our terms to ensure compliance and a smooth experience. Your information is secure and can be updated anytime.",
  fields: [
    {
      name: "username",
      type: "string",
      required: true,
      description:
        "A unique username to identify you on the platform. Must be 1–50 characters.",
      constraints: {
        max_length: 50,
        min_length: 1,
      },
    },
    {
      name: "firstname",
      type: "string",
      required: true,
      description:
        "Your first name. This will be displayed on your profile. Maximum 100 characters.",
      constraints: {
        max_length: 100,
        min_length: 1,
      },
    },
    {
      name: "lastname",
      type: "string",
      required: true,
      description:
        "Your last name. This will be displayed on your profile. Maximum 100 characters.",
      constraints: {
        max_length: 100,
        min_length: 1,
      },
    },
    {
      name: "phone_number",
      type: "string",
      required: false,
      description:
        "Your phone number (optional). Include country code (e.g., +1234567890). Must contain only digits, +, -, or spaces. Maximum 20 characters.",
      constraints: {
        max_length: 20,
        pattern: "^[\\d\\+\\-\\s]*$",
      },
    },
    {
      name: "data_processing_consent",
      type: "boolean",
      required: true,
      description:
        "Consent to process your data as per our privacy policy. Required to proceed.",
      constraints: {},
    },
    {
      name: "terms_accepted_at",
      type: "string",
      required: true,
      description:
        "Timestamp when you accept our terms of service (ISO 8601 format, e.g., '2025-08-01T14:52:00Z'). Set to current time when submitting.",
      constraints: {
        format: "date-time",
      },
    },
  ],
  example_data: {
    username: "johndoe",
    firstname: "John",
    lastname: "Doe",
    phone_number: "+1234567890",
    data_processing_consent: true,
    terms_accepted_at: "2025-08-01T14:52:00Z",
  },
};

export const professionalInformation = {
  step: 2,
  title: "Professional Information",
  description: "Share your professional background to showcase your expertise.",
  greeting:
    "Congratulations on making it to the second step of creating your professional portfolio!",
  page_writeup:
    "In this step, tell us about your professional journey. Whether you're a seasoned expert or just starting out, these details help potential employers or collaborators understand your skills and career goals. Only your job seeking status is required; other fields can be filled in to enhance your profile's appeal.",
  fields: [
    {
      index: 0,
      name: "profession",
      type: "string",
      required: false,
      description:
        "Your profession (e.g., Software Engineer). Maximum 255 characters.",
      constraints: {
        max_length: 255,
      },
    },
    {
      index: 1,
      name: "job_title",
      type: "string",
      required: false,
      description:
        "Your current or desired job title (e.g., Senior Developer). Maximum 255 characters.",
      constraints: {
        max_length: 255,
      },
    },
    {
      index: 2,
      name: "years_of_experience",
      type: "number",
      required: false,
      description:
        "Years of professional experience. Must be a non-negative integer.",
      constraints: {
        minimum: 0,
      },
    },
    {
      index: 3,
      name: "bio",
      type: "string",
      required: false,
      description:
        "A short biography describing your professional background. Maximum 1000 characters.",
      constraints: {
        max_length: 1000,
      },
    },
    {
      index: 4,
      name: "job_seeking_status",
      type: "dropdown",
      required: true,
      description: "Your current job seeking status.",
      constraints: {
        enum_values: [
          { id: "actively_looking", code: "Actively Looking" },
          { id: "open_to_opportunities", code: "Open to Opportunities" },
          { id: "passively_looking", code: "Passively Looking" },
          { id: "not_looking_but_open", code: "Not Looking, But Open" },
          { id: "not_seeking", code: "Not Seeking" },
          { id: "available_immediately", code: "Available Immediately" },
          { id: "seeking_internship", code: "Seeking Internship" },
          { id: "freelance", code: "Freelance" },
          { id: "exploring_career_change", code: "Exploring Career Change" },
          { id: "networking_only", code: "Networking Only" },
          { id: "on_hold", code: "On Hold" },
        ],
      },
    },
    {
      index: 5,
      name: "preferred_work_type",
      type: "enum",
      required: false,
      description: "Preferred type of work (e.g., full-time, freelance).",
      constraints: {
        enum_values: [
          { id: "full_time", code: "Full Time" },
          { id: "part_time", code: "Part Time" },
          { id: "contract", code: "Contract" },
          { id: "freelance", code: "Freelance" },
          { id: "internship", code: "Internship" },
          { id: "temporary", code: "Temporary" },
          { id: "seasonal", code: "Seasonal" },
          { id: "volunteer", code: "Volunteer" },
          { id: "apprenticeship", code: "Apprenticeship" },
          { id: "remote", code: "Remote" },
          { id: "hybrid", code: "Hybrid" },
        ],
      },
    },
    {
      index: 6,
      name: "open_to_work",
      type: "boolean",
      required: false,
      description: "Whether you are open to new work opportunities.",
      constraints: {},
    },
    {
      index: 7,
      name: "availability",
      type: "dropdown",
      required: false,
      description:
        "Your availability (e.g., 'Immediate', '1 month notice', etc.). Maximum 255 characters.",
      constraints: {
        max_length: 255,
        enum: [
          {
            id: "immediate",
            code: "Immediate",
          },
          {
            id: "1_month",
            code: "1 month notice",
          },
          {
            id: "2_months",
            code: "2 months notice",
          },
          {
            id: "3_months",
            code: "3 months notice",
          },
          {
            id: "negotiable",
            code: "Negotiable",
          },
          {
            id: "unavailable",
            code: "Currently unavailable",
          },
        ],
      },
    },
  ],
  example_data: {
    profession: "Software Engineer",
    job_title: "Senior Developer",
    years_of_experience: 5,
    bio: "Passionate developer with expertise in web development and cloud solutions.",
    job_seeking_status: "open_to_opportunities",
    preferred_work_type: "full_time",
    open_to_work: true,
    availability: "Immediate",
  },
};

export const contactAndLocation = {
  step: 3,
  title: "Contact and Location",
  description:
    "Provide your contact details and location to connect with others.",
  page_writeup:
    "Let’s make it easy for others to reach you! In this step, add your website, GitHub, and location to enhance your profile’s visibility. Specify how you prefer to be contacted to streamline communication with potential collaborators or employers.",
  fields: [
    {
      name: "website_url",
      type: "string",
      required: false,
      description:
        "Your personal website URL (e.g., https://example.com). Must start with http:// or https://. Maximum 255 characters.",
      constraints: {
        max_length: 255,
        pattern: "^https?://.*",
      },
    },
    {
      name: "github_username",
      type: "string",
      required: false,
      description:
        "Your GitHub username (e.g., johndoe). Maximum 255 characters.",
      constraints: {
        max_length: 255,
      },
    },
    {
      name: "location",
      type: "string",
      required: false,
      description:
        "Your location (e.g., New York, NY). Maximum 255 characters.",
      constraints: {
        max_length: 255,
      },
    },
    {
      name: "preferred_contact_method",
      type: "enum",
      required: true,
      description: "Your preferred method of contact.",
      constraints: {
        enum_values: ["email", "phone", "website"],
      },
    },
    {
      name: "available_for_contact",
      type: "boolean",
      required: true,
      description: "Whether you are available for contact.",
      constraints: {},
    },
  ],
  example_data: {
    website_url: "https://johndoe.com",
    github_username: "johndoe",
    location: "New York, NY",
    preferred_contact_method: "email",
    available_for_contact: true,
  },
};

export const privacyAndNotification = {
  step: 4,
  title: "Privacy and Notifications",
  description: "Customize your privacy settings and notification preferences.",
  page_writeup:
    "Control how your information is shared and stay informed with your preferred notifications. In this step, you can decide who sees your contact details, whether search engines can index your profile, and how we communicate with you. These settings ensure your profile aligns with your privacy and engagement preferences.",
  fields: [
    {
      name: "show_email",
      type: "boolean",
      required: true,
      description: "Whether to display your email publicly on your profile.",
      constraints: {},
    },
    {
      name: "show_phone",
      type: "boolean",
      required: true,
      description:
        "Whether to display your phone number publicly on your profile.",
      constraints: {},
    },
    {
      name: "allow_indexing",
      type: "boolean",
      required: true,
      description:
        "Allow search engines to index your profile for better discoverability.",
      constraints: {},
    },
    {
      name: "show_last_active",
      type: "boolean",
      required: true,
      description: "Show when you were last active on the platform.",
      constraints: {},
    },
    {
      name: "email_notifications",
      type: "boolean",
      required: true,
      description:
        "Receive notifications via email (e.g., for profile updates or messages).",
      constraints: {},
    },
    {
      name: "push_notifications",
      type: "boolean",
      required: true,
      description: "Receive push notifications on supported devices.",
      constraints: {},
    },
    {
      name: "marketing_emails",
      type: "boolean",
      required: true,
      description:
        "Receive marketing emails about new features and promotions.",
      constraints: {},
    },
    {
      name: "weekly_digest",
      type: "boolean",
      required: true,
      description: "Receive a weekly digest of platform updates and activity.",
      constraints: {},
    },
    {
      name: "profile_visibility",
      type: "enum",
      required: true,
      description: "Control who can view your profile.",
      constraints: {
        enum_values: ["public", "private", "network_only"],
      },
    },
  ],
  example_data: {
    show_email: false,
    show_phone: false,
    allow_indexing: true,
    show_last_active: true,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    weekly_digest: true,
    profile_visibility: "public",
  },
};

export const appearance = {
  step: 5,
  title: "Appearance and Finalization",
  description: "Personalize the look and feel of your profile.",
  page_writeup:
    "You’re almost done! In this final step, choose your preferred language and the visual style of your profile. These settings let you customize how your profile appears to others, making it uniquely yours. After this, you can review your profile and make it live!",
  fields: [
    {
      name: "language",
      type: "enum",
      required: true,
      description: "Your preferred language for the platform.",
      constraints: {
        enum_values: ["en", "es", "fr"],
      },
    },
    {
      name: "theme",
      type: "enum",
      required: true,
      description: "The visual theme for your profile.",
      constraints: {
        enum_values: ["light", "dark", "custom"],
      },
    },
    {
      name: "layout_style",
      type: "enum",
      required: true,
      description: "The layout style for your profile.",
      constraints: {
        enum_values: ["modern", "creative", "minimalist"],
      },
    },
  ],
  example_data: {
    language: "en",
    theme: "custom",
    layout_style: "modern",
  },
};

import {
  FaUser,
  FaUserEdit,
  FaPhone,
  FaCheckCircle,
  FaBriefcase,
  FaChartLine,
  FaFileAlt,
  FaSearch,
  FaGlobe,
  FaGithub,
  FaMapMarkerAlt,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaBell,
  FaShieldAlt,
  FaPalette,
  FaLanguage,
  FaBrush,
} from "react-icons/fa";

export const onboardingSteps = [
  {
    step: "1",
    title: "Account Basics",
    description:
      "Provide your basic account information to set up your profile.",
    icons: [
      { icon: FaUser, label: "Username" },
      { icon: FaUserEdit, label: "Name" },
      { icon: FaPhone, label: "Phone" },
      { icon: FaCheckCircle, label: "Consent" },
    ],
  },
  {
    step: "2",
    title: "Professional Information",
    description:
      "Share your professional background to showcase your expertise.",
    icons: [
      { icon: FaBriefcase, label: "Profession" },
      { icon: FaChartLine, label: "Experience" },
      { icon: FaFileAlt, label: "Bio" },
      { icon: FaSearch, label: "Job Status" },
    ],
  },
  {
    step: "3",
    title: "Contact and Location",
    description:
      "Provide your contact details and location to connect with others.",
    icons: [
      { icon: FaGlobe, label: "Website" },
      { icon: FaGithub, label: "GitHub" },
      { icon: FaMapMarkerAlt, label: "Location" },
      { icon: FaEnvelope, label: "Contact Method" },
    ],
  },
  {
    step: "4",
    title: "Privacy and Notifications",
    description:
      "Customize your privacy settings and notification preferences.",
    icons: [
      { icon: FaEye, label: "Visibility" },
      { icon: FaEyeSlash, label: "Privacy" },
      { icon: FaBell, label: "Notifications" },
      { icon: FaShieldAlt, label: "Security" },
    ],
  },
  {
    step: "5",
    title: "Appearance and Finalization",
    description: "Personalize the look and feel of your profile.",
    icons: [
      { icon: FaPalette, label: "Theme" },
      { icon: FaLanguage, label: "Language" },
      { icon: FaCheckCircle, label: "Completion" },
      { icon: FaBrush, label: "Customization" }, // Changed label to avoid duplication
    ],
  },
];
