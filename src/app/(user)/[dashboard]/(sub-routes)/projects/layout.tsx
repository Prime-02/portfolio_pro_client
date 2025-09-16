'use client'; // If using hooks like useSelectedLayoutSegment

export default function ConnectLayout({
  children,
  connect,
}: {
  children: React.ReactNode;
  connect: React.ReactNode;
}) {

  return (
    <div>
      {children}
      {connect}
    </div>
  );
}