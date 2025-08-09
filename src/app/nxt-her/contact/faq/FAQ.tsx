// "use client";

// import { useState } from 'react';
// import { ChevronDown, ChevronUp } from 'lucide-react';

// interface FAQItem {
//   id: number;
//   question: string;
//   answer: string;
// }

// const faqData: FAQItem[] = [
//   {
//     id: 1,
//     question: "How can I get in touch with JUUN.J for collaborations?",
//     answer: "We're always open to new creative ventures. For partnership or collaboration inquiries, please fill out our Collaboration Inquiry Form on the Contact Us page, and our team will review and reach out if there's a match."
//   },
//   {
//     id: 2,
//     question: "Where can I find information on JUUN.J campaigns and releases?",
//     answer: "You can find the latest information about our campaigns and releases on our official website, social media channels, and by subscribing to our newsletter. We regularly update our platforms with new content and announcements."
//   },
//   {
//     id: 3,
//     question: "How can I reach your customer support team?",
//     answer: "Our customer support team is available through multiple channels. You can reach us via email at support@juunj.com, through our contact form, or by calling our dedicated support line during business hours."
//   },
//   {
//     id: 4,
//     question: "How to Purchase JUUN.J Products?",
//     answer: "JUUN.J products are available through our authorized retailers, flagship stores, and select online platforms. You can find our complete list of stockists on our website, or contact our sales team for direct inquiries."
//   }
// ];

// export default function FAQSection() {
//   const [openItems, setOpenItems] = useState<number[]>([1]); // First item open by default

//   const toggleItem = (id: number) => {
//     setOpenItems(prev => 
//       prev.includes(id) 
//         ? prev.filter(item => item !== id)
//         : [...prev, id]
//     );
//   };

//   return (
//     <section className="py-20 bg-white">
//       <div className="container mx-auto px-4 lg:px-8">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-5xl lg:text-6xl font-bold text-black mb-16">
//             FREQUENTLY ASKED QUESTIONS
//           </h2>
          
//           <div className="space-y-6">
//             {faqData.map((item) => (
//               <div key={item.id} className="border-b border-gray-200">
//                 <button
//                   onClick={() => toggleItem(item.id)}
//                   className="w-full py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
//                 >
//                   <span className="text-lg font-medium text-black">
//                     {item.question}
//                   </span>
//                   {openItems.includes(item.id) ? (
//                     <ChevronUp className="w-5 h-5 text-black" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5 text-gray-400" />
//                   )}
//                 </button>
                
//                 {openItems.includes(item.id) && (
//                   <div className="pb-6">
//                     <p className="text-gray-600 leading-relaxed">
//                       {item.answer}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


'use client'

import { useState } from 'react';

const faqData = [
  {
    question: "How can I get in touch with JUUN.J for collaborations?",
    answer:
      "We’re always open to new creative ventures. For partnership or collaboration inquiries, please fill out our Collaboration Inquiry Form on the Contact Us page, and our team will review and reach out if there’s a match.",
  },
  {
    question: "Where can I find information on JUUN.J campaigns and releases?",
    answer: "You can follow our official website and social channels for the latest updates on JUUN.J campaigns and product launches.",
  },
  {
    question: "How can I reach your customer support team?",
    answer: "You can reach out to our customer support team via the email provided in the Contact Us section.",
  },
  {
    question: "How to Purchase JUUN.J Products?",
    answer: "JUUN.J products are available on our official website and selected retailers. Check our website for more information.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-8 py-16 max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8 uppercase">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="border-b pb-4">
            <button
              onClick={() => setOpenIndex(index === openIndex ? null : index)}
              className="w-full text-left flex justify-between items-center font-medium"
            >
              {item.question}
              <span>{index === openIndex ? '−' : '+'}</span>
            </button>
            {index === openIndex && (
              <p className="mt-2 text-sm text-gray-700">{item.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
