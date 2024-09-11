"use client";
import Banner from "@src/components/landing-sections/banner";
import Features from "@src/components/landing-sections/features";
import HowItWorks from "@src/components/landing-sections/howItWorks";
import { ScrollProvider } from "@src/context/scroll-context";

export default function Home() {
  return (
    <div className="h-full w-full ">
      <Banner />
      <HowItWorks />
      <Features />
    </div>
  );
}
