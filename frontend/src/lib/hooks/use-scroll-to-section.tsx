import { useRef } from "react";

export default function useScrollToSection() {
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return {
    howItWorksRef,
    featuresRef,
    scrollToSection,
  };
}
