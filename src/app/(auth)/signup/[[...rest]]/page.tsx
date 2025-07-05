// app/login/page.jsx
import { SignUp } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <SignUp path="/signup" routing="path" />{" "}
    </div>
  );
}
