import { BrainCircuit, HandHeart, Target, Info } from "lucide-react";

export function MentalWellnessSection() {
  const supportServices = [
    {
      icon: <HandHeart className="h-8 w-8 text-blue-500" />,
      title: "Immediate Psychosocial Support",
      description: "Mental health first aid for job seekers experiencing anxiety, low motivation, or emotional stress.",
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-purple-500" />,
      title: "Mental Wellness Check-ins",
      description: "Brief one-on-one counseling sessions to enhance emotional preparedness and resilience.",
    },
    {
      icon: <Target className="h-8 w-8 text-green-500" />,
      title: "Career-Focused Psychological Support",
      description: "Confidence building, handling rejection, and aligning career goals.",
    },
    {
      icon: <Info className="h-8 w-8 text-yellow-500" />,
      title: "Resources & Referrals",
      description: "Informational materials and guided referrals for continued mental health support post-event.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Mental Wellness & Psychosocial Support
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            At the Nation-Huawei Job Fair 2025, we are proud to offer a dedicated booth for mental wellness, staffed by licensed counselors and psychologists to support an estimated 500-700 participants.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {supportServices.map((service, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex-shrink-0 mb-4">
                {service.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 