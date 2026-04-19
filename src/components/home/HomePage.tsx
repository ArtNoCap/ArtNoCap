import { AudienceSection } from "@/components/home/AudienceSection";
import { CtaBannerSection } from "@/components/home/CtaBannerSection";
import { FeaturedProjectsSection } from "@/components/home/FeaturedProjectsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { JournalTeaserSection } from "@/components/home/JournalTeaserSection";

export function HomePage({ showSignupCta = true }: { showSignupCta?: boolean }) {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <JournalTeaserSection />
      <AudienceSection />
      <FeaturedProjectsSection />
      {showSignupCta ? <CtaBannerSection /> : null}
    </>
  );
}
