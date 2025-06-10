// tests/SettingsPage.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsPage from "@/components/SettingPage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Mock next-auth and router
jest.mock("next-auth/react");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    useSession.mockReturnValue({
      data: {
        user: {
          name: "Test User",
          email: "test@example.com",
          photo: "test-photo.jpg",
          role: "user",
        },
      },
      update: jest.fn(),
    });

    useRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  it("renders user info correctly", () => {
    render(<SettingsPage />);
    expect(screen.getByPlaceholderText("Full Name").value).toBe("Test User");
    expect(screen.getByPlaceholderText("Email").value).toBe("test@example.com");
  });

  it("displays error when trying to save with empty name", async () => {
    render(<SettingsPage />);
    fireEvent.change(screen.getByPlaceholderText("Full Name"), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(screen.getByText("Name and email are required")).toBeInTheDocument();
    });
  });

  it("shows Become a Teacher button for 'user' role", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Become a Teacher")).toBeInTheDocument();
  });

  it("triggers image upload on change", async () => {
    render(<SettingsPage />);

    const fileInput = screen.getByLabelText("Upload Photo");

    const file = new File(["(⌐□_□)"], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

  });

});