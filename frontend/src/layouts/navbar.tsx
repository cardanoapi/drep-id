"use client";

import React, { useState } from "react";
import AnchorLink from "@src/components/atoms/links/anchor-link";
import Burger from "@src/components/icons/burger";
import { useScrollContext } from "@src/context/scroll-context";
import { useParams, useRouter } from "next/navigation";

function Navbar() {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const { scrollToSection, howItWorksRef, featuresRef } = useScrollContext();
  const router = useRouter();
  const params = useParams();
  const handleNavigation = (ref: React.RefObject<HTMLDivElement>) => {
    if (params.page !== undefined) {
      router.replace("/");
    }
    scrollToSection(ref);
    if (isMenuVisible) {
      setMenuVisible(false);
    }
  };
  return (
    <nav className="relative top-0 !z-30 flex h-[100px] w-full flex-col items-center justify-center bg-primary-900 text-white ">
      <div className="flex w-full max-w-[1440px] px-6 sm:px-[96px] items-center justify-between gap-10">
        <AnchorLink
          className="h4"
          href="/"
          aria-label="navigate to landing page"
        >
          DRepID
        </AnchorLink>
        <div className="body3 hidden items-center gap-10 text-text-primary sm:flex">
          <p className="cursor-pointer" onClick={() => router.replace("/")}>
            Home
          </p>
          <p
            className="cursor-pointer"
            onClick={() => handleNavigation(howItWorksRef)}
          >
            How it works
          </p>
          <p
            className="cursor-pointer"
            onClick={() => handleNavigation(featuresRef)}
          >
            Features
          </p>
        </div>
        {/* <!-- mobile button goes here --> */}
        <div className="flex items-center sm:hidden">
          <Burger
            className="h-6 w-6 cursor-pointer "
            onClick={() => {
              setMenuVisible(!isMenuVisible);
            }}
          />
        </div>
      </div>
      {/* <!-- mobile menu --> */}
      {isMenuVisible && (
        <div className="absolute top-[100px] flex w-full flex-col items-center gap-8 bg-primary-900 text-white px-5 py-6 sm:hidden">
          <p className="cursor-pointer" onClick={() => router.replace("/")}>
            Home
          </p>
          <p
            className="cursor-pointer"
            onClick={() => handleNavigation(howItWorksRef)}
          >
            How it works
          </p>
          <p
            className="cursor-pointer"
            onClick={() => handleNavigation(featuresRef)}
          >
            Features
          </p>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
