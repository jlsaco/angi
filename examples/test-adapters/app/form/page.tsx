"use client";

import { Angi } from "@angi-ai/angi/client";
import RegistrationForm from "@/components/RegistrationForm";

export default function FormPage() {
  return (
    <div className="max-w-lg mx-auto py-12 px-6">
      <Angi id="registration-form" permissions={["read", "write"]}>
        <RegistrationForm />
      </Angi>
    </div>
  );
}
