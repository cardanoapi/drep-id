import { howItWork } from "@src/models/dtos";
import Image from "next/image";

export default function HowItWorksCard(step: howItWork) {
  return (
    <div className="border-[2.5px] rounded-br-[50px] rounded-tl-[50px]  relative overflow-visible border-primary-800">
      <div className="h-[76px] w-[76px] -translate-x-1/2 left-1/2 -top-[38px] absolute ">
        <Image src={step.icon} alt="how it works icons" />
      </div>
      <div className="flex top-0 left-0  px-7 py-14 flex-col gap-4">
        <p className="h4 font-bold text-primary-900">{step.title}</p>
        <p className="body2 text-neutral-800">{step.description}</p>
      </div>
    </div>
  );
}
