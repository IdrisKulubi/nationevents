"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Step1Form, type Step1FormData } from "./step-1-form"
import { Step2Form, type Step2FormData } from "./step-2-form"
import { Progress } from "@/components/ui/progress"

type RegistrationData = Step1FormData & Step2FormData & { profilePhoto?: File }

interface RegistrationFlowProps {
  onComplete?: (data: RegistrationData) => void
}

export function RegistrationFlow({ onComplete }: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<RegistrationData>>({})

  const handleStep1Next = (data: Step1FormData & { profilePhoto?: File }) => {
    setFormData(prev => ({ ...prev, ...data }))
    setCurrentStep(2)
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
  }

  const handleStep2Next = async (data: Step2FormData) => {
    setIsLoading(true)
    
    try {
      const completeData = { ...formData, ...data } as RegistrationData
      
      // Submit registration data
      const response = await fetch("/api/nxt-her/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...completeData,
          // Handle file upload separately if needed
          profilePhoto: completeData.profilePhoto ? undefined : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Registration failed")
      }

      const result = await response.json()
      
      // Handle profile photo upload if present
      if (completeData.profilePhoto) {
        const formData = new FormData()
        formData.append("file", completeData.profilePhoto)
        formData.append("attendeeId", result.attendeeId)

        const uploadResponse = await fetch("/api/nxt-her/upload-profile-photo", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          console.warn("Profile photo upload failed, but registration succeeded")
        }
      }

      toast.success("Registration completed successfully! Please check your email for confirmation.")
      
      if (onComplete) {
        onComplete(completeData)
      }
      
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const progressValue = (currentStep / 2) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Nxt Her Summit
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Register for an empowering experience of connection, learning, and growth
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className={currentStep >= 1 ? "text-purple-600 font-medium" : ""}>
                Personal Details
              </span>
              <span className={currentStep >= 2 ? "text-purple-600 font-medium" : ""}>
                Professional Details
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>

        {/* Form Steps */}
        {currentStep === 1 && (
          <Step1Form
            onNext={handleStep1Next}
            initialData={formData}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && (
          <Step2Form
            onNext={handleStep2Next}
            onBack={handleStep2Back}
            initialData={formData}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}