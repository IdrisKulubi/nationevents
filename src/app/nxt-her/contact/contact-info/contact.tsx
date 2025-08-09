// export default function ContactInfoSection() {
//   return (
//     <section className="py-20 bg-white">
//       <div className="container mx-auto px-4 lg:px-8">
//         <div className="max-w-6xl mx-auto space-y-12">
//           {/* PRESS */}
//           <div className="space-y-4">
//             <h3 className="text-2xl font-bold text-black">PRESS</h3>
//             <div className="space-y-2 text-gray-700">
//               <p className="font-semibold">SAMSUNG C&T CORPORATION (MILAN OFFICE)</p>
//               <p className="text-sm">
//                 Centro Direzionale Milanofiori, Strada 2, PALAZZO C1, 20057 Assago Milano, Italy
//               </p>
//               <p className="font-semibold">JUUNJ PR</p>
//               <a 
//                 href="mailto:JUUNJ.PR@Samsung.com" 
//                 className="text-black hover:text-gray-600 transition-colors"
//               >
//                 JUUNJ.PR@Samsung.com
//               </a>
//             </div>
//           </div>

//           {/* SALES */}
//           <div className="space-y-4">
//             <h3 className="text-2xl font-bold text-black">SALES</h3>
//             <div className="space-y-2 text-gray-700">
//               <p className="font-semibold">JUUN.J SHOWROOM</p>
//               <a 
//                 href="mailto:showroom.it@samsung.com" 
//                 className="text-black hover:text-gray-600 transition-colors"
//               >
//                 showroom.it@samsung.com
//               </a>
//             </div>
//           </div>

//           {/* HEAD OFFICE */}
//           <div className="space-y-4">
//             <h3 className="text-2xl font-bold text-black">HEAD OFFICE</h3>
//             <div className="space-y-2 text-gray-700">
//               <p className="font-semibold">JUUN.J SAMSUNG C&T CORPORATION</p>
//               <p className="text-sm">
//                 2806, Nambusunhwang-Ro, Gangnam-Gu, Seoul, Republic of Korea
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


import Image from 'next/image';

export default function ContactSection() {
  return (
    <section className="relative w-full min-h-[90vh] px-8 py-16 flex flex-col md:flex-row items-start gap-12">
      <div className="max-w-xl z-10">
        <h1 className="text-[8vw] leading-none font-bold uppercase mb-4">Contact Us</h1>
        <p className="mb-8 text-gray-600 max-w-md">For any inquiries, collaborations, or just to say hello, we'd love to hear from you! Reach out, and let’s connect</p>

        <div className="space-y-8">
          <div>
            <h2 className="font-bold uppercase text-sm">Press</h2>
            <p className="text-sm">
              SAMSUNG C&T CORPORATION (MILAN OFFICE)<br />
              Centro Direzionale Milanofiori, Strada 2, PALAZZO C1, 20057 Assago Milano, Italy<br />
              <br />
              JUUN.J PR<br />
              <a href="mailto:JUUNJ.PR@samsung.com" className="underline">JUUNJ.PR@samsung.com</a>
            </p>
          </div>

          <div>
            <h2 className="font-bold uppercase text-sm">Sales</h2>
            <p className="text-sm">
              JUUN.J SHOWROOM<br />
              <a href="mailto:showroom.it@samsung.com" className="underline">showroom.it@samsung.com</a>
            </p>
          </div>

          <div>
            <h2 className="font-bold uppercase text-sm">Head Office</h2>
            <p className="text-sm">
              JUUN.J SAMSUNG C&T CORPORATION<br />
              2806, Nambusunhwan-ro, Gangnam-Gu, Seoul,<br />
              Republic of Korea
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-10 z-0 w-[45%] hidden md:block">
        <Image
          src="/images/model.png"
          alt="Model"
          width={600}
          height={800}
          className="object-cover mix-blend-darken"
        />
      </div>
    </section>
  );
}
