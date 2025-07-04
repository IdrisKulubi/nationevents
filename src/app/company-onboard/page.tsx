import { CompanyGoogleLogin } from "@/components/auth/company-google-login";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function CompanyOnboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logos */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image
              src="/huawei-logo.png"
              alt="Huawei"
              width={100}
              height={40}
              className="object-contain"
            />
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
            <Image
              src="/nationlogo.png"
              alt="Nation Media Group"
              width={80}
              height={32}
              className="object-contain"
            />
          </div>
          <CardTitle>Company Registration</CardTitle>
          <CardDescription>
            Sign in with Google to register your company for the Nation-Huawei Career Summit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyGoogleLogin />
        </CardContent>
      </Card>
    </div>
  );
} 