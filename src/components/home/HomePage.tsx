import { AudienceSection } from "@/components/home/AudienceSection";
import { CtaBannerSection } from "@/components/home/CtaBannerSection";
import { FeaturedProjectsSection } from "@/components/home/FeaturedProjectsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <AudienceSection />
      <FeaturedProjectsSection />
      <CtaBannerSection />
    </>
  );
}
