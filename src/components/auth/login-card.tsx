"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

const employerLoginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  phoneNumber: z.string().min(10, "Please enter a valid phone number."),
});

type EmployerLoginValues = z.infer<typeof employerLoginSchema>;

export function LoginCard() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmployerLoginValues>({
    resolver: zodResolver(employerLoginSchema),
    defaultValues: { email: "", phoneNumber: "" },
  });

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleEmployerSubmit = async (values: EmployerLoginValues) => {
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      phoneNumber: values.phoneNumber,
    });

    if (result?.error) {
      toast.error("Login Failed", {
        description: "Invalid email or phone number. Please try again.",
      });
    } else if (result?.ok) {
      toast.success("Login Successful", {
        description: "Redirecting you to the dashboard...",
      });
      router.push("/dashboard");
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-md">
      <Tabs defaultValue="job_seeker" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="job_seeker">Job Seeker</TabsTrigger>
          <TabsTrigger value="employer">Employer</TabsTrigger>
        </TabsList>
        <TabsContent value="job_seeker">
          <CardHeader>
            <CardTitle>Job Seeker Login</CardTitle>
            <CardDescription>
              Sign in with your Google account to access the job fair portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full"
              variant="outline"
            >
              Continue with Google
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our Terms of Service.
            </p>
          </CardContent>
        </TabsContent>
        <TabsContent value="employer">
          <CardHeader>
            <CardTitle>Employer Login</CardTitle>
            <CardDescription>
              Sign in with your company email and phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
          <form
                onSubmit={form.handleSubmit(handleEmployerSubmit)}
            className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="email">Email</Label>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="company@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <FormControl>
                        <Input
                          id="phoneNumber"
                          placeholder="+1234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
            </Form>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
