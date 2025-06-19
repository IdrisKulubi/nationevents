import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { ConferenceSection } from "@/components/landing/conference-section";
import { TimelineSection } from "@/components/landing/timeline-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="pt-12 md:pt-24"></div>
            <HeroSection />
            <ConferenceSection />
            <TimelineSection />
            <FooterSection />
        </main>
    );
}