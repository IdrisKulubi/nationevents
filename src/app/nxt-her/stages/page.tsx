import { StagesHeroSection } from "@/app/stages/hero/stages-hero-section"
import { StageDetailsSection } from "@/app/stages/details/stage-details-section"
import ImageComponent from "@/app/stages/footer/image"

export default function StagesPage() {
  return (
    <div>
      <StagesHeroSection />
      <StageDetailsSection />
      <ImageComponent />
    </div>
  )
}
