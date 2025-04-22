import React from "react";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Logo + About */}
        <div>
          <div className="mb-4">
            <Image src="/images/logo2.png" alt="StudyNest Logo" width={120} height={120} />
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            StudyNest is your gateway to success — offering expertly crafted courses and a vibrant community of learners and mentors.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="hover:text-green-500 cursor-pointer">Home</li>
            <li className="hover:text-green-500 cursor-pointer">Courses</li>
            <li className="hover:text-green-500 cursor-pointer">About Us</li>
            <li className="hover:text-green-500 cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="text-sm text-gray-400 space-y-3">
            <li>Email: support@studynest.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Location: Jordan</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} StudyNest. All rights reserved.
      </div>
    </footer>
  );
};
