'use client';

export default function ConnectLayout({
  children,
  connect,
}: {
  children: React.ReactNode;
  connect?: React.ReactNode; // Make it optional
}) {
  return (
    <div>
      {children}
      {connect || null} {/* Handle case where connect is undefined */}
    </div>
  );
}