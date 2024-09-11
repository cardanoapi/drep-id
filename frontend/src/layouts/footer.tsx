import AnchorLink from "@src/components/atoms/links/anchor-link";
import Love from "@src/components/icons/love";
import NepalFlag from "@src/components/icons/nepal";

export default function Footer() {
  return (
    <div className="flex h-[144px] w-full items-center justify-center ">
      <div className="body3 !font-normal flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 text-neutral-700 sm:gap-6 px-6 sm:px-[96px]">
        <p> &copy; 2024 Sireto Technology. All rights reserved.</p>
        <div className="flex gap-1 items-center">
          <span>Build with</span> <Love /> <span>from</span> <NepalFlag />
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <AnchorLink href="/privacy-policy">Privacy Policy</AnchorLink>
          <AnchorLink href="/terms-of-services">Terms of Services</AnchorLink>
        </div>
      </div>
    </div>
  );
}
