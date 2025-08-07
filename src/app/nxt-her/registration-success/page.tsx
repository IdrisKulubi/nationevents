import { CheckCircle, Mail, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Welcome to Nxt Her Summit! Your registration has been submitted successfully.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Check Your Email</h3>
              </div>
              <p className="text-blue-800 text-sm">
                We've sent a confirmation email with your registration details and next steps. 
                Please check your inbox and spam folder.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">What's Next?</h3>
                </div>
                <p className="text-purple-800 text-sm">
                  Your registration is currently under review. You'll receive an approval 
                  notification within 24-48 hours.
                </p>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold text-pink-900">Get Ready</h3>
                </div>
                <p className="text-pink-800 text-sm">
                  Once approved, you'll gain access to your personalized dashboard, 
                  networking features, and event schedule.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-gray-600 text-sm">
                Have questions? Contact us at{" "}
                <a 
                  href="mailto:support@nxthersummit.com" 
                  className="text-purple-600 hover:underline"
                >
                  support@nxthersummit.com
                </a>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/">
                    Return to Home
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/nxt-her/login">
                    Go to Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}