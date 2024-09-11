"use-client";

import React from "react";
import cn from "classnames";
import Navbar from "@src/layouts/navbar";
import Footer from "@src/layouts/footer";

interface ILayoutProps {
  className?: string;
}

export default function Layout({
  children,
  className,
}: React.PropsWithChildren<ILayoutProps>) {
  return (
    <div className="dark:bg-dark bg-white z-20 w-full min-h-screen ">
      <Navbar />
      <main
        className={cn(
          `flex h-full min-h-calc-244 w-full flex-col items-center justify-center bg-white`,
          className,
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
