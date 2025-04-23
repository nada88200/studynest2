'use client'; // For App Router only

import React from 'react';
import Link from 'next/link';

const mockMessages = [
  { id: 1, name: 'Rama Bani Awwad', email: 'rbaniawwad2@gmail.com' },
  { id: 2, name: 'Nada Abu Khalifeh', email: 'nadak4171@gmail.com' },
  { id: 3, name: 'Zaina Alnabulsi', email: 'Zainaab2021@gmail.com' },
  { id: 4, name: 'Saja Abedalqader', email: 'sajjaabedalqader@gmail.com' },
  { id: 5, name: 'Ehab Salem', email: 'ehab51459@gmail.com' },
];

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Messages</h1>

        <table className="min-w-full table-auto border border-gray-300 text-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-6 py-4 border-b">Name</th>
              <th className="px-6 py-4 border-b">Email</th>
            </tr>
          </thead>
          <tbody>
            {mockMessages.map((msg) => (
              <tr key={msg.id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 border-b">{msg.name}</td>
                <td className="px-6 py-4 border-b">
                <a href={`mailto:${msg.email}`} className="text-blue-600 hover:text-blue-800">
                    {msg.email}
                </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center mt-8">
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;