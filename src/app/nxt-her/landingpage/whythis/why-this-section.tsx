import Image from "next/image"

export function WhyThisSection() {
  return (
    <section className="py-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-8">
              WHY THIS,
              <br />
              <span className="text-blue-800">WHY NOW?</span>
            </h2>

            <div className="space-y-6 text-gray-700 text-lg">
              <p>
                Thirty years after the Beijing Declaration, gender equality faces new and complex challenges, from climate change to 
                economic inequality and shrinking spaces for women's voices. In Africa, women are leading and innovating, yet remain underrepresented and excluded from key resources. 
                With a young, digital‑driven population, the time is now to reframe narratives, address intersectional barriers, and ignite lasting change.
              </p>

            </div>
          </div>

          <div className="relative">
            <div className="h-120 overflow-hidden rounded-lg shadow-xl bg-white">
              <Image
                src="/women/Picture17.jpg"
                alt="Why This, Why Now"
                width={500}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
