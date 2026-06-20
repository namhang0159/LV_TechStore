"use client";
import Link from "next/link";
import React from "react";

export const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-900 text-white py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4 text-sm">Công ty</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">Hỗ trợ</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">Pháp lý</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/policies?tab=terms" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies?tab=privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies?tab=cookies" className="hover:text-white transition">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">Địa chỉ</h4>
            <p className="text-xs text-gray-400">
              123 Tech Street, Silicon Valley, CA 94025
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-400">
          <p>Copyright © 2026 RIU Tech Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
