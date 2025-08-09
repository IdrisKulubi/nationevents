import Image from "next/image"

export function AboutHeroSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About NXT HERizon Summit</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A transformative gathering marking 30 years since the Beijing Declaration and Platform for Action
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <Image
              src="/images/why-this-now.png"
              alt="About the Summit"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-lg text-gray-700">
              The NXT HERizon Summit is more than a conference—it's a movement. We're bringing together the continent's
              most dynamic women changemakers, innovators, and storytellers to shape the next 30 years of progress.
            </p>
            <p className="text-lg text-gray-700">
              This convening is a time capsule and a launchpad, reflecting on women's journey over the past thirty years
              while boldly envisioning the next thirty.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-summit-blue mb-2">March 15-16</div>
                <div className="text-gray-600">2024</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-amaranth-purple mb-2">Nairobi</div>
                <div className="text-gray-600">Kenya</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
