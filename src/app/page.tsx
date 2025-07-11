import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { MentalWellnessSection } from "@/components/landing/mental-wellness-section";
import { ConferenceSection } from "@/components/landing/conference-section";
import { TimelineSection } from "@/components/landing/timeline-section";
import { SeeYouSoon } from "@/components/landing/see-you-soon";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="pt-12 md:pt-24"></div>
            <HeroSection />
            <MentalWellnessSection />
            <ConferenceSection />
            <TimelineSection />
            <SeeYouSoon />
            <FooterSection />
        </main>
    );
}