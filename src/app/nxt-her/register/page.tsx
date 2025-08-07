import { RegistrationFlow } from "@/components/nxt-her/registration/registration-flow"

export default function NxtHerRegisterPage() {
  return (
    <RegistrationFlow 
      onComplete={(data) => {
        // Redirect to success page or dashboard
        window.location.href = "/nxt-her/registration-success"
      }}
    />
  )
}