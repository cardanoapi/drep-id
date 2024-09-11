"use client";

import React, { useState } from "react";
import AnchorLink from "@src/components/atoms/links/anchor-link";
import Burger from "@src/components/icons/burger";

function Navbar() {
  const [isMenuVisible, setMenuVisible] = useState(false);
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
          <p className="cursor-pointer">Home</p>
          <p className="cursor-pointer">How it works</p>
          <p className="cursor-pointer">Features</p>
        </div>
        {/* <!-- mobile button goes here --> */}
        <div className="flex items-center sm:hidden">
          <Burger
            className="h-6 w-6 cursor-pointer"
            onClick={() => {
              setMenuVisible(!isMenuVisible);
            }}
          />
        </div>
      </div>
      {/* <!-- mobile menu --> */}
      {isMenuVisible && (
        <div className="absolute top-[100px] flex w-full flex-col items-center gap-8 bg-white px-5 py-6 lg:hidden">
          <p className="cursor-pointer">Home</p>
          <p className="cursor-pointer">How it works</p>
          <p className="cursor-pointer">Features</p>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
