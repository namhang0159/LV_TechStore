import { Suspense } from "react";
import PaymentResultContent from "./PaymentResultContent";

export const dynamic = "force-dynamic";

export default function PaymentResult() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
