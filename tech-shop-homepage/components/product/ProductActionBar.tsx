"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "details", label: "Details" },
  { id: "about", label: "About Product" },
  { id: "specs", label: "Specs" },
  { id: "feedback", label: "Feedback" },
  { id: "more-info", label: "More information" },
];

interface ProductActionBarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function ProductActionBar({
  activeTab,
  onTabChange,
}: ProductActionBarProps) {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white border-b border-gray-200 py-3 mb-8">
          <div className="text-xs text-gray-600">
            <a href="#" className="hover:text-blue-600">
              Home
            </a>
            {" / "}
            <a href="#" className="hover:text-blue-600">
              Laptops
            </a>
            {" / "}
            <span className="text-gray-900">Laptop MSI Series</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
