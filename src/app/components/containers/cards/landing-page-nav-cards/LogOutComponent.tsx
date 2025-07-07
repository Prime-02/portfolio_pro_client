import Button from "@/app/components/buttons/Buttons";
import { SignOutButton } from "@clerk/nextjs";
import React from "react";

const LogOutComponent = () => {
  return (
    <div className="flex flex-col items-center min-h-full h-auto justify-around">
      <p className="mb-6 font-semibold">Are you sure you want to log out?</p>
      <div>
        <SignOutButton redirectUrl="/">
          <Button variant="danger" size="md" text="Proceed?" />
        </SignOutButton>
      </div>
    </div>
  );
};

export default LogOutComponent;
