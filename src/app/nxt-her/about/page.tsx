import { WhyThisSection } from "@/app/landingpage/whythis/why-this-section"
import { GenderRealitiesSection } from "@/app/landingpage/genderrealities/gender-realities-section"
import { WhyNationMediaSection } from "@/app/landingpage/nationmedia/why-nation-media-section"
import { AboutHeroSection } from "@/app/about/hero/about-hero-section"

export default function AboutPage() {
  return (
    <div>
      <AboutHeroSection />
      <WhyThisSection />
      <GenderRealitiesSection />
      <WhyNationMediaSection />
    </div>
  )
}
