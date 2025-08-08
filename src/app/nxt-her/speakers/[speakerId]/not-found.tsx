import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserX, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default function SpeakerNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserX className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Speaker Not Found
                </h1>
                <p className="text-gray-600">
                  The speaker profile you're looking for doesn't exist or may have been removed.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link href="/nxt-her/speakers" className="block">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    View All Speakers
                  </Button>
                </Link>
                
                <Link href="/nxt-her/dashboard" className="block">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}