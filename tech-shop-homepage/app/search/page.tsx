import { Suspense } from "react";
import SearchResults from "./SearchResults";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Đang tải...</p></div>}>
      <SearchResults />
    </Suspense>
  );
}
