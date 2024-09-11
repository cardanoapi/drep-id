"use client";

import { features } from "@src/constants";
import FeatureCard from "@src/components/cards/featureCard";
import { useScrollContext } from "@src/context/scroll-context";

export default function Features() {
  const { featuresRef } = useScrollContext();
  return (
    <div
      ref={featuresRef}
      className="flex justify-center items-center sm:py-[120px] py-[60px]"
    >
      <div className="flex flex-col max-w-[1440px] !px-[96px] sm:px-6">
        <p className="h2 font-bold text-primary-900">{features.title}:</p>
        <p className="h3 font-semibold text-primary-900 mt-2 mb-[120px]">
          {features.description}
        </p>
        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-[56px]">
          {features.steps.map((step) => {
            return <FeatureCard key={step.id} {...step} />;
          })}
        </div>
      </div>
    </div>
  );
}
