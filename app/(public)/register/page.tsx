import { z } from "zod";
import RegistrationSection from "./_sections/RegistrationSection";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegistrationSection />
    </div>
  );
}
