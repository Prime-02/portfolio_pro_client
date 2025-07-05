// app/login/page.jsx
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <SignIn path="/login" routing="path" />
    </div>
  );
}
