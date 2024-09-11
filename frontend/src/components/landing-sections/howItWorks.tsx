import { howItWorks } from "@src/constants";
import HowItWorksCard from "../cards/howItWorks";

export default function HowItWorks() {
  return (
    <div className="flex justify-center items-center sm:py-[120px] py-[60px]">
      <div className=" flex flex-col max-w-[1440px] !px-[96px] sm:px-6">
        <p className="h2 font-bold text-primary-900">{howItWorks.title}:</p>
        <p className="h3 font-semibold text-primary-900 mt-2 mb-[120px]">
          {howItWorks.description}
        </p>
        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1  gap-[56px]">
          {howItWorks.steps.map((step) => {
            return <HowItWorksCard key={step.id} {...step} />;
          })}
        </div>
      </div>
    </div>
  );
}
