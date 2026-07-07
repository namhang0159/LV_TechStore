import { Suspense } from "react";
import PoliciesContent from "./PoliciesContent";

export const dynamic = "force-dynamic";

export default function PoliciesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <PoliciesContent />
    </Suspense>
  );
}
