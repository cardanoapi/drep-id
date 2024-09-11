import useScrollToSection from "@src/lib/hooks/use-scroll-to-section";
import React, { createContext, useContext } from "react";

interface ScrollContextProps {
  scrollToSection: (ref: React.RefObject<HTMLDivElement>) => void;
  howItWorksRef: React.RefObject<HTMLDivElement>;
  featuresRef: React.RefObject<HTMLDivElement>;
}

const ScrollContext = createContext<ScrollContextProps | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollToSectionParams = useScrollToSection();

  return (
    <ScrollContext.Provider value={scrollToSectionParams}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScrollContext must be used within a ScrollProvider");
  }
  return context;
};
