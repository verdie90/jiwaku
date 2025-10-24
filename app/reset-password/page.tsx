"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetForm } from "./reset-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  return <ResetForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
