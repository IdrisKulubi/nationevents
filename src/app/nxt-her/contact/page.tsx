

import Image from 'next/image';
import FaqSection from './faq/FAQ';

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-white text-black font-sans overflow-hidden">
      {/* Right Background Image (Full Height) */}
      <div className="hidden md:block fixed top-0 right-0 h-full w-[50%] bg-white">
        <Image
          src="/women/Picture22.png"
          alt="Model"
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* Left Foreground Content */}
      <div className="relative z-10 w-full md:w-[50%] px-6 py-16 space-y-8">
        <section>
          <h1 className="text-[8vw] font-bold leading-none uppercase mb-4">Contact Us</h1>
          <p className="mb-6 text-gray-600 max-w-md">For any inquiries, collaborations, we'd love to hear from you! Reach out, and let’s connect</p>

          <div className="space-y-8 text-sm">
            <div>
              {/* <h2 className="font-bold uppercase text-xs">Press</h2>
              <p>
                SAMSUNG C&T CORPORATION (MILAN OFFICE)<br />
                Centro Direzionale Milanofiori, Strada 2,<br />
                PALAZZO C1, 20057 Assago Milano, Italy<br />
                <br />
                JUUN.J PR<br />
                <a href="mailto:JUUNJ.PR@samsung.com" className="underline">JUUNJ.PR@samsung.com</a>
              </p> */}
            </div>

            <div>
              <h2 className="font-bold text-black uppercase text-xs">EMAIL</h2>
              <p>
                <a href="mailto:showroom.it@samsung.com" className="underline">showroom.it@samsung.com</a>
              </p>
            </div>

            <div>
              <h2 className="font-bold uppercase text-xs">Head Office</h2>
              <p>
                JUUN.J SAMSUNG C&T CORPORATION<br />
                2806, Nambusunhwan-ro, Gangnam-Gu, Seoul,<br />
                Republic of Korea
              </p>
            </div>
          </div>
        </section>

        <FaqSection />
      </div>
    </main>
  );
}
