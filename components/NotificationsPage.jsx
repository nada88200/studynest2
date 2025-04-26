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
      details: "Don't forget to complete your homework and submit by next Friday.",
    },
    {
      id: 2,
      sender: "Alice",
      message: "Accepted your request",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      details: "Alice has accepted your course request and will be available for a meeting.",
    },
    {
      id: 3,
      sender: "Charlie",
      message: "Weekly report is ready",
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      details: "You can now view the weekly performance report in your dashboard.",
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null); // New state for selected notification

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter =
      filter === "all" ? true : filter === "read" ? n.read : !n.read;
    const matchesSearch =
      n.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const mostFrequentSender =
    notifications.length > 0
      ? Object.entries(
          notifications.reduce((acc, curr) => {
            acc[curr.sender] = (acc[curr.sender] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification); // Set the clicked notification
  };

  return (
    <div>
      <Nav />
      <div className="h-[calc(100vh-70px)] w-full bg-gradient-to-br from-indigo-900 to-purple-800 pt-[12vh] min-h-screen text-white">
        <div className="flex h-full overflow-hidden">
          {/* Sidebar */}
          <div className="w-[300px] flex-shrink-0 bg-white bg-opacity-5 backdrop-blur-lg border-r border-white/20 p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Notifications</h2>
                <div className="relative">
                  <Bell className="w-6 h-6 text-yellow-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 text-xs bg-yellow-400 text-black font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-1 rounded bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`text-sm px-2 py-1 rounded ${
                    filter === "all"
                      ? "bg-yellow-400 text-black"
                      : "text-white hover:text-yellow-400"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`text-sm px-2 py-1 rounded ${
                    filter === "unread"
                      ? "bg-yellow-400 text-black"
                      : "text-white hover:text-yellow-400"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={`text-sm px-2 py-1 rounded ${
                    filter === "read"
                      ? "bg-yellow-400 text-black"
                      : "text-white hover:text-yellow-400"
                  }`}
                >
                  Read
                </button>
              </div>
              <button
                onClick={markAllAsRead}
                className="text-sm text-white hover:text-yellow-400 transition"
              >
                Mark all as read
              </button>
              <div className="border-t border-white/20 pt-4 space-y-4 max-h-[75vh] overflow-y-auto">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)} // Handle click
                    className={`p-4 rounded-xl transition shadow-inner cursor-pointer flex justify-between items-start ${
                      notif.read
                        ? "bg-white/10 border border-white/20"
                        : "bg-yellow-400/10 border-2 border-yellow-400"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm ${
                          notif.read
                            ? "text-white/70"
                            : "text-yellow-300 font-semibold"
                        }`}
                      >
                        <span className="font-bold">{notif.sender}</span>: {notif.message}
                      </p>
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1 ml-4 text-xs">
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n.id === notif.id ? { ...n, read: !n.read } : n
                            )
                          )
                        }
                        className="text-yellow-300 hover:text-yellow-400"
                      >
                        {notif.read ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.filter((n) => n.id !== notif.id)
                          )
                        }
                        className="text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-10">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Hello {session?.user?.name || "User"} 👋
            </h1>
            <p className="text-lg text-white/70 mb-6">
              Here's a summary of your recent notifications.
            </p>

            {/* Display selected notification details */}
            {selectedNotification ? (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
                <h2 className="text-xl font-semibold">{selectedNotification.sender}</h2>
                <p className="mt-4 text-lg">{selectedNotification.message}</p>
                <p className="mt-2 text-sm text-white/60">{selectedNotification.details}</p>
                <p className="mt-2 text-xs text-white/50">
                  {formatDistanceToNow(selectedNotification.timestamp, {
                    addSuffix: true,
                  })}
                </p>
                <button
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === selectedNotification.id
                          ? { ...n, read: true }
                          : n
                      )
                    )
                  }
                  className="mt-4 text-yellow-300 hover:text-yellow-400"
                >
                  Mark as Read
                </button>
              </div>
            ) : (
              <p className="text-white/70">
                Select from the list of notifications on the side to view more details.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold">Total Notifications</h3>
                <p className="text-3xl font-bold mt-2">{notifications.length}</p>
                <p className="text-sm text-white/60 mt-1">From all senders</p>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold">Unread</h3>
                <p className="text-3xl font-bold mt-2">
                  {notifications.filter((n) => !n.read).length}
                </p>
                <p className="text-sm text-white/60 mt-1">
                  You have unread messages
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold">Most Frequent Sender</h3>
                <p className="text-2xl font-bold mt-2">{mostFrequentSender}</p>
                <p className="text-sm text-white/60 mt-1">Sent you the most updates</p>
              </div>
            </div>

            {notifications.length === 0 && (
              <div className="mt-6 text-white/70">
                🎉 You're all caught up! No notifications at the moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}