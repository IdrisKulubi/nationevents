"use client"

import { useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { SessionFeedbackForm, SessionFeedbackFormData } from "./session-feedback-form"
import { QuickPulseSurvey } from "./quick-pulse-survey"
import { useMediaQuery } from "@/hooks/use-mobile"

interface MobileFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  sessionTitle: string
  sessionSpeakers?: string[]
  mode?: "quick" | "detailed"
  onModeChange?: (mode: "quick" | "detailed") => void
}

export function MobileFeedbackModal({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
  sessionSpeakers = [],
  mode = "quick",
  onModeChange,
}: MobileFeedbackModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentMode, setCurrentMode] = useState<"quick" | "detailed">(mode)

  const handleModeChange = (newMode: "quick" | "detailed") => {
    setCurrentMode(newMode)
    if (onModeChange) {
      onModeChange(newMode)
    }
  }

  const handleQuickComplete = () => {
    onClose()
  }

  const handleQuickToDetailed = () => {
    handleModeChange("detailed")
  }

  const handleDetailedSubmit = (data: SessionFeedbackFormData) => {
    onClose()
  }

  const content = (
    <div className="space-y-4">
      {currentMode === "quick" ? (
        <QuickPulseSurvey
          sessionId={sessionId}
          sessionTitle={sessionTitle}
          sessionSpeakers={sessionSpeakers}
          onComplete={handleQuickComplete}
          onSkip={onClose}
          onDetailedFeedback={handleQuickToDetailed}
          className="border-0 shadow-none"
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleModeChange("quick")}
              className="text-sm"
            >
              ← Back to Quick Survey
            </Button>
          </div>
          <SessionFeedbackForm
            sessionId={sessionId}
            sessionTitle={sessionTitle}
            sessionSpeakers={sessionSpeakers}
            onSubmit={handleDetailedSubmit}
            onClose={onClose}
            className="border-0 shadow-none"
          />
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <DrawerTitle>
                {currentMode === "quick" ? "Session Feedback" : "Detailed Feedback"}
              </DrawerTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {currentMode === "quick" ? "Session Feedback" : "Detailed Feedback"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}