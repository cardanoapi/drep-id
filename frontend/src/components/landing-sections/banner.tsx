import { Button } from "@headlessui/react";
import { banner } from "@src/constants";

export default function Banner() {
  return (
    <div className="sm:pt-[136px] sm:pb-[194px] py-[60px] bg-primary-900 flex justify-center items-center">
      <div className="max-w-[1440px] flex justify-between items-center md:flex-row flex-col lg:gap-[150px] gap-[75px] sm:px-[96px] px-6 ">
        <p className="h1 font-bold text-white">{banner.title}</p>
        <div className="flex flex-col gap-10">
          <p className="body1 !font-medium text-white">{banner.description}</p>
          <Button className="bg-primary-600 px-6 py-4 w-fit text-white body1 font-semibold rounded-[8px]">
            Connect Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
