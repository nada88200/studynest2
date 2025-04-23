// // app/aboutus/page.tsx OR pages/aboutus.tsx
// 'use client'; // Only if you're using the App Router and want to use client-side navigation

// import React from 'react';
// import Link from 'next/link';

// const AboutUsPage = () => {
//   return (
//     <main className="min-h-screen bg-gray-100 py-20 px-6">
//       <div className="max-w-4xl mx-auto text-center">
//         <h1 className="text-3xl font-bold mb-6">About StudyNest</h1>
//         <p className="text-gray-700 text-lg leading-relaxed mb-8">
//           StudyNest is dedicated to empowering students through high-quality online education.
//           We bring together expert instructors, interactive content, and a supportive learning environment
//           to help you succeed in your academic and professional journey.
//         </p>

//         {/* Back to Dashboard Button */}
//         <Link href="/dashboard">
//           <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
//             Back to Dashboard
//           </button>
//         </Link>
//       </div>
//     </main>
//   );
// };

// export default AboutUsPage;
// app/aboutus/page.tsx OR pages/aboutus.tsx
'use client'; // Only if you're using the App Router

import React from 'react';
import Link from 'next/link';

const AboutUsPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          About <span className="font-bold text-indigo-600 text-5xl">StudyNest</span>
        </h1>
        <p className="text-gray-800 text-lg leading-relaxed mb-8">
          <span className="font-bold text-indigo-600 text-2xl">StudyNest</span> is an innovative platform designed to simplify the academic experience for university students by
          centralizing essential academic resources in one place. With <span className="font-bold text-indigo-600 text-2xl">StudyNest</span>, students can access study materials,
          lecture notes, exam tools, and more, all within a single platform. Our mission is to reduce student stress,
          improve productivity, and foster a collaborative learning environment.

          Our Motivation comes from the challenges students face in managing their academic resources across
          multiple platforms. <span className="font-bold text-indigo-600 text-2xl">StudyNest</span> aims to solve this by offering a personalized,
          user-centered approach with customizable features. We provide an integrated coding platform,
          qualified tutors for personalized help, and tools to quickly review key concepts. Our platform also includes sections
          for managing projects, homework, and collaborating with peers, making it easier for students to stay organized
          and engaged.

          The Problem We Solve includes fragmented resources, limited academic support, inefficient review tools,
          and inadequate coding environments in existing platforms. <span className="font-bold text-indigo-600 text-2xl">StudyNest</span> centralizes resources, enhances review tools,
          and academic management. We aim to streamline the academic experience and support students in all their academic needs,
          from the start of their studies to graduation.
        </p>

        <Link href="/dashboard">
          <button className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </main>
  );
};

export default AboutUsPage;
