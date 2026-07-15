import { useUIStore } from "@/lib/stores/ui/useUIStore";
import Button from "@/src/app/components/buttons/Buttons";
import Link from "next/link";
import React from "react";

const HelpComponent = () => {
  const { toggleMobileMenu } = useUIStore()
  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Need help?</h3>
        <p className=" mb-4">{`We're here to assist you`}</p>

        <div className="flex flex-col gap-3">
          <Link href="/contact-us">
            <Button
              variant="ghost"
              size="md"
              text="Contact support"
              className="w-full"
              onClick={() => {
                toggleMobileMenu(false)
              }}
            />
          </Link>

          <Link href="/faq">
            <Button
              variant="ghost"
              size="md"
              text="Browse FAQs"
              className="w-full"
              onClick={() => {
                toggleMobileMenu(false)
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpComponent;
