"use client"
import { Bell } from "lucide-react";
import { useToast } from "./Toastify";
import { useAuth, useUser } from "@clerk/nextjs";
// Demo Component
export const ToastDemo: React.FC = () => {
  const toast = useToast();
  const { userId } = useAuth();
  const user = useUser().user;


  const demoToasts = [
    {
      label: "Success Toast",
      action: () => {
        console.log("Possible User Info ", user);

        toast.success("Operation completed successfully!", {
          title: "Success",
          description: "Your changes have been saved.",
          duration: 4000,
        });
      },
    },
    {
      label: "Error Toast",
      action: () =>
        toast.error("Something went wrong!", {
          title: "Error",
          description: "Please try again later.",
          persistent: true,
        }),
    },
    {
      label: "Warning Toast",
      action: () =>
        toast.warning("Please review your input", {
          title: "Warning",
          action: {
            label: "Review",
            onClick: () => console.log("Review clicked"),
          },
        }),
    },
    {
      label: "Info Toast",
      action: () =>
        toast.info("New update available", {
          title: "Information",
          position: "bottom-right",
          animation: "bounce",
        }),
    },
    {
      label: "Custom Toast",
      action: () =>
        toast.toast("Custom message with sound!", {
          type: "default",
          icon: <Bell className="w-5 h-5 text-purple-600" />,
          className: "border-purple-200 bg-purple-50 text-purple-800",
          sound: true,
          animation: "scale",
          position: "bottom-center",
        }),
    },
    {
      label: "Loading Toast",
      action: () => {
        const id = toast.info("Processing...", {
          persistent: true,
          progress: false,
          closable: false,
        });

        setTimeout(() => {
          toast.update(id, {
            type: "success",
            message: "Processing complete!",
            persistent: false,
            duration: 3000,
            closable: true,
          });
        }, 2000);
      },
    },
  ];

  return (
    <div className="p-8 space-y-4">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold  mb-2">Toast Notification System</h1>
        <p className=" mb-6">
          A sophisticated toast notification system with full customization
          capabilities. Features include multiple types, positions, animations,
          progress bars, actions, and more.
        </p>

        <div>
          <p>User ID: {userId}</p>
          <p>User email: {user?.emailAddresses[0]?.emailAddress}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {demoToasts.map((demo, index) => (
            <button
              key={index}
              onClick={() => {
                demo.action();
              }}
              className={`px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm`}
            >
              {demo.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => toast.dismissAll()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Dismiss All
          </button>
        </div>

        <div className="mt-8 p-4  rounded-lg">
          <h3 className="font-semibold mb-2">Features:</h3>
          <ul className="text-sm  space-y-1">
            <li>
              • Multiple toast types (success, error, warning, info, default)
            </li>
            <li>• Flexible positioning (6 positions available)</li>
            <li>• Custom animations (slide, fade, bounce, scale)</li>
            <li>• Progress bars and auto-dismiss</li>
            <li>• Action buttons and custom styling</li>
            <li>• Sound notifications and persistence options</li>
            <li>• TypeScript support with full type safety</li>
            <li>• Accessible and keyboard navigation ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
