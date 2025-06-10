//components/NotificationsPage.jsx
"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { Nav } from "@/Home/Navbar/Nav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [processingInvites, setProcessingInvites] = useState({});

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.map(async (n) => {
          if (!n.read) {
            await fetch(`/api/notifications/${n._id}`, {
              method: "PATCH",
              body: JSON.stringify({ read: true }),
              headers: { "Content-Type": "application/json" },
            });
          }
          return { ...n, read: true };
        })
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("Marked all as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    markAsRead(notification);
  };

  const markAsRead = async (notification) => {
    if (notification.read) return;
    
    try {
      await fetch(`/api/notifications/${notification._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications(prev =>
        prev.map(n => 
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleAcceptInvite = async (notification) => {
    setProcessingInvites(prev => ({...prev, [notification._id]: true}));
    
    try {
      const inviteId = notification.metadata?.inviteId || notification._id;
      
      if (!inviteId) {
        throw new Error("No invitation ID found in notification");
      }
  
      const response = await fetch(`/api/communities/invites/${inviteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }
  
      // Check for success flag in response
      if (!data.success) {
        throw new Error(data.message || "Failed to accept invitation");
      }
  
      // Refresh notifications
      const updatedNotifications = await fetch("/api/notifications").then(res => res.json());
      setNotifications(updatedNotifications);
      
      // Removed the toast.success() line
      
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast.error(error.message);
    } finally {
      setProcessingInvites(prev => ({...prev, [notification._id]: false}));
    }
  };


  const handleRejectInvite = async (notification) => {
    setProcessingInvites(prev => ({...prev, [notification._id]: true}));
    
    try {
      const inviteId = notification.metadata?.inviteId;
      if (!inviteId) {
        throw new Error("Invalid invitation data");
      }

      const res = await fetch(`/api/communities/invites/${inviteId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reject invite");
      }

      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      toast.success("Invitation declined");
    } catch (error) {
      console.error("Error rejecting invite:", error);
      toast.error(error.message);
    } finally {
      setProcessingInvites(prev => ({...prev, [notification._id]: false}));
    }
  };

  const deleteNotification = async (notification) => {
    try {
      await fetch(`/api/notifications/${notification._id}`, {
        method: "DELETE",
      });
      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter =
      filter === "all" ? true : filter === "read" ? n.read : !n.read;
    const matchesSearch =
      (n.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.message?.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <Nav />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
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
                {loading ? (
                  <div role="status" className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-yellow-400" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <p className="text-center text-white/70 py-4">No notifications found</p>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 rounded-xl transition shadow-inner cursor-pointer flex justify-between items-start ${
                        notif.read
                          ? "bg-white/10 border border-white/20"
                          : "bg-yellow-400/10 border-2 border-yellow-400"
                      }`}
                    >
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            notif.read
                              ? "text-white/70"
                              : "text-yellow-300 font-semibold"
                          }`}
                        >
                          {notif.message}
                        </p>

                        {/* Community Invite Actions */}
                        {notif.type === "community_invite" && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptInvite(notif);
                              }}
                              disabled={processingInvites[notif._id]}
                              className={`bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                processingInvites[notif._id] ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {processingInvites[notif._id] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectInvite(notif);
                              }}
                              disabled={processingInvites[notif._id]}
                              className={`bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                processingInvites[notif._id] ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {processingInvites[notif._id] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X size={12} />
                              )}
                              Reject
                            </button>
                          </div>
                        )}

                        {/* Teacher Request Actions */}
                        {notif.type === "teacher_request" && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
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
                              onClick={async (e) => {
                                e.stopPropagation();
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
                          <span className="text-xs text-white/50 mt-1 block">
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
                            markAsRead(notif);
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
                  ))
                )}
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
                <h2 className="text-xl font-semibold">
                  {selectedNotification.sender?.name || "System Notification"}
                </h2>
                <p className="mt-4 text-lg">{selectedNotification.message}</p>
                {selectedNotification.type === "community_invite" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleAcceptInvite(selectedNotification)}
                      disabled={processingInvites[selectedNotification._id]}
                      className={`bg-green-600 text-white px-4 py-2 rounded-lg ${
                        processingInvites[selectedNotification._id] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingInvites[selectedNotification._id] ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        "Accept Invitation"
                      )}
                    </button>
                    <button
                      onClick={() => handleRejectInvite(selectedNotification)}
                      disabled={processingInvites[selectedNotification._id]}
                      className={`bg-red-600 text-white px-4 py-2 rounded-lg ${
                        processingInvites[selectedNotification._id] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingInvites[selectedNotification._id] ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        "Decline Invitation"
                      )}
                    </button>
                  </div>
                )}
                {selectedNotification?.createdAt && (
                  <p className="mt-4 text-xs text-white/50">
                    {formatDistanceToNow(new Date(selectedNotification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-white/70">
                Select a notification from the sidebar to view details.
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
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold">Community Invites</h3>
                <p className="text-3xl font-bold mt-2">
                  {notifications.filter(n => n.type === "community_invite").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}