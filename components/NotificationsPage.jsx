"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Nav } from "@/Home/Navbar/Nav";
import React from "react";



export default function NotificationsPage() {
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      sender: "Dexter",
      message: "You have upcoming activities due next week",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: 2,
      sender: "Alice",
      message: "Accepted your request",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: 3,
      sender: "Charlie",
      message: "Weekly report is ready",
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  return (
    <div>
  <Nav />

  <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center px-4 py-12">
    <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#0e139d]">
          Hello {session?.user?.name || "Guest"}
        </h1>

        <div className="relative">
          <Bell className="text-[#0e139d] w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs bg-[#c6c311] text-white font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        <button
          className="text-sm font-medium text-[#0e139d] hover:text-[#c6c311] transition"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-4 rounded-xl border flex justify-between items-start shadow-sm transition ${
                notif.read
                  ? "bg-gray-100 border-gray-200"
                  : "bg-[#eef0ff] border-[#c6c311]"
              }`}
            >
              <div>
                <p
                  className={`text-sm ${
                    notif.read
                      ? "text-gray-600"
                      : "text-[#0e139d] font-semibold"
                  }`}
                >
                  <span className="font-bold">{notif.sender}</span>: {notif.message}
                </p>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</div>

  );
}