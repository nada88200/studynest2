"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Nav } from "@/Home/Navbar/Nav";
import React from "react";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const updated = await Promise.all(
        notifications.map(async (n) => {
          if (!n.read) {
            await fetch(`/api/notifications/${n._id}`, {
              method: "PATCH",
              body: JSON.stringify({ read: true }), // or false
              headers: { "Content-Type": "application/json" },
            });            
          }
          return { ...n, read: true };
        })
      );
      setNotifications(updated);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter =
      filter === "all" ? true : filter === "read" ? n.read : !n.read;
    const matchesSearch =
      (typeof n.sender === "string" &&
        n.sender.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof n.message === "string" &&
        n.message.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });


  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const toggleReadStatus = async (notif) => {
    try {
      const updatedRead = !notif.read;
      await fetch(`/api/notifications/${notif._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: updatedRead }),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id ? { ...n, read: updatedRead } : n
        )
      );      
    } catch (error) {
      console.error("Failed to toggle read status:", error);
    }
  };

  const deleteNotification = async (notif) => {
    try {
      await fetch(`/api/notifications/${notif._id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notif._id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  

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
                {["all", "unread", "read"].map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`text-sm px-2 py-1 rounded ${
                      filter === key
                        ? "bg-yellow-400 text-black"
                        : "text-white hover:text-yellow-400"
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
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
                    onClick={() => handleNotificationClick(notif)}
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
                         {notif.message}
                      </p>

                      {notif.type === "teacher_request" && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={async () => {
                              await fetch(`/api/teacher-request-response`, {
                                method: "POST",
                                body: JSON.stringify({
                                  userId: notif.senderId,
                                  accepted: true,
                                }),
                                headers: { "Content-Type": "application/json" },
                              });
                              deleteNotification(notif);
                            }}
                            className="bg-green-600 text-white text-xs px-2 py-1 rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              await fetch(`/api/teacher-request-response`, {
                                method: "POST",
                                body: JSON.stringify({
                                  userId: notif.senderId,
                                  accepted: false,
                                }),
                                headers: { "Content-Type": "application/json" },
                              });
                              deleteNotification(notif);
                            }}
                            className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {notif.createdAt && (
                        <span className="text-xs text-white/50">
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1 ml-4 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReadStatus(notif);
                        }}
                        className="text-yellow-300 hover:text-yellow-400"
                      >
                        {notif.read ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif);
                        }}
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

          {/* Main Content */}
          <div className="flex-1 p-10">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Hello {session?.user?.name || "User"} 👋
            </h1>
            <p className="text-lg text-white/70 mb-6">
              Here's a summary of your recent notifications.
            </p>

            {selectedNotification ? (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
                <h2 className="text-xl font-semibold">{selectedNotification.sender}</h2>
                <p className="mt-4 text-lg">{selectedNotification.message}</p>
                <p className="mt-2 text-sm text-white/60">{selectedNotification.details}</p>
                {selectedNotification?.timestamp && !isNaN(new Date(selectedNotification.timestamp)) && (
                  <p className="mt-2 text-xs text-white/50">
                    {formatDistanceToNow(new Date(selectedNotification.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                )}
                <button
                  onClick={() =>
                    toggleReadStatus(selectedNotification)
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
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold">Unread</h3>
                <p className="text-3xl font-bold mt-2">{unreadCount}</p>
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
