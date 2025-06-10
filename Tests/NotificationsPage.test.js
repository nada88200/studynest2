import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import NotificationsPage from "@/components/NotificationsPage";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

// Mock next-auth session
jest.mock("next-auth/react");

// Mock toastify to suppress actual toasts
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div />,
}));

// Mock global fetch
global.fetch = jest.fn();

describe("NotificationsPage", () => {
  const sessionData = {
    user: { name: "Test User" },
    accessToken: "fake-token",
  };

  const notificationsMock = [
    {
      _id: "1",
      message: "You have a new message",
      read: false,
      type: "general",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      message: "Community invite received",
      read: false,
      type: "community_invite",
      metadata: { inviteId: "invite-123" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "3",
      message: "Teacher request",
      read: true,
      type: "teacher_request",
      senderId: "user-123",
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    useSession.mockReturnValue({ data: sessionData });
    fetch.mockReset();
  });

  it("fetches and displays notifications", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => notificationsMock,
    });

    render(<NotificationsPage />);

    // Wait for notifications to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByText("You have a new message")).toBeInTheDocument();
      expect(screen.getByText("Community invite received")).toBeInTheDocument();
      expect(screen.getByText("Teacher request")).toBeInTheDocument();
    });
  });

  it("shows loading spinner while fetching", () => {
    fetch.mockReturnValue(new Promise(() => {})); // never resolves

    render(<NotificationsPage />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("handles error when fetching notifications", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load notifications");
    });
  });

  it("marks all notifications as read", async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => notificationsMock }) // fetch notifications
      .mockResolvedValue({ ok: true, json: async () => ({}) }); // patch calls

    render(<NotificationsPage />);

    // Wait for notifications to load
    await waitFor(() => screen.getByText("You have a new message"));

    const markAllBtn = screen.getByText("Mark all as read");
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Marked all as read");
    });

    // The notifications state should update: no unread badges
    expect(screen.queryByText("You have a new message")).toBeInTheDocument();
  });

  it("accepts community invite", async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => notificationsMock }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, message: "Joined!" }) }) // accept invite POST
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // refresh notifications

    render(<NotificationsPage />);

    // Wait for loading
    await waitFor(() => screen.getByText("Community invite received"));

    // Click accept button on community invite notification
    const acceptBtn = screen.getAllByText("Accept")[0];
    fireEvent.click(acceptBtn);

   
  });

  it("rejects community invite", async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => notificationsMock }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // delete invite

    render(<NotificationsPage />);

    await waitFor(() => screen.getByText("Community invite received"));

    const rejectBtn = screen.getAllByText("Reject")[0];
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Invitation declined");
    });
  });

  it("deletes a notification", async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => notificationsMock }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // delete notification

    render(<NotificationsPage />);

    await waitFor(() => screen.getByText("You have a new message"));

    const deleteBtns = screen.getAllByText("Delete");
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Notification deleted");
    });
  });
});
