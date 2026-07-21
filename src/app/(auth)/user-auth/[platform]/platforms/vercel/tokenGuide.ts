interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  imageUrl?: string;
}

const vercelTokenSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Log in to Vercel",
    description:
      "Go to vercel.com and sign in to the account you want to generate a token for.",
    actionLabel: "Go to Vercel",
    actionUrl: "https://vercel.com/login",
    imageUrl: "/socials/vercel/guide/step_1.png", // e.g. "/onboarding/vercel-login.png"
  },
  {
    id: 2,
    title: "Open Account Settings",
    description:
      "Click your avatar in the top-right corner, then select 'Settings' from the popup.",
    imageUrl: "/socials/vercel/guide/step_2.png",
  },
  {
    id: 3,
    title: "Navigate to Tokens",
    description:
      "In the settings sidebar, click on 'Tokens' under the Account section.",
    actionUrl: "https://vercel.com/account/tokens",
    imageUrl: "/socials/vercel/guide/step_3.png",
  },
  {
    id: 4,
    title: "Name your token",
    description:
      "Give the token a descriptive name (e.g. 'portfolio-pro-ci' or 'local-dev') so you can identify its purpose later, select an account scope, and expiration duration.",
    imageUrl: "/socials/vercel/guide/step_4.png",
  },
  {
    id: 5,
    title: "Create Token",
    description: "Click the 'Create' button to generate a new token.",
    imageUrl: "/socials/vercel/guide/step_5.png",
  },
  {
    id: 6,
    title: "Copy the token",
    description:
      "Vercel will show the token value only once — copy it immediately, paste here and make sure to save it securely.",
    imageUrl: "/socials/vercel/guide/step_6.png",
  },
];

export default vercelTokenSteps;
