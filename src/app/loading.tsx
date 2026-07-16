import PortfolioProLogo from "./components/logo/PortfolioProTextLogo";

// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex justify-center w-full items-center h-screen">
      <PortfolioProLogo
        tracking={0.2}
        scale={0.65}
        fontWeight={"extrabold"}
        reanimateDelay={3000}
      />{" "}
    </div>
  );
}
