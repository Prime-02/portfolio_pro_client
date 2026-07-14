"use client";

export default function ConnectLayout({
  children,
  // connect,
}: {
  children: React.ReactNode;
  // connect: React.ReactNode;
}) {



  return (
    <div>
      {children}
      {/* {connect || null} */}
    </div>
  );
}
