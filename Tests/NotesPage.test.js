import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotesPage from "../app/notes/page";
 // Adjust if needed
import { SessionProvider } from "next-auth/react";

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

// Wrapper with session
const renderWithSession = (ui) => {
  return render(<SessionProvider session={{ user: { name: "Test" } }}>{ui}</SessionProvider>);
};

describe("NotesPage", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("renders the Notes page UI", async () => {
    renderWithSession(<NotesPage />);
    expect(await screen.findByText(/My Notes/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by tags/i)).toBeInTheDocument();
  });

  it("opens the editor when clicking + New Note", () => {
    renderWithSession(<NotesPage />);
    const newNoteButton = screen.getByText("+ New Note");
    fireEvent.click(newNoteButton);
    expect(screen.getByPlaceholderText(/Note Title/i)).toBeInTheDocument();
  });

  it("adds a tag when pressing Enter", async () => {
    renderWithSession(<NotesPage />);
    fireEvent.click(screen.getByText("+ New Note"));

    const tagInput = screen.getByPlaceholderText(/Add Tags/i);
    fireEvent.change(tagInput, { target: { value: "important" } });
    fireEvent.keyDown(tagInput, { key: "Enter", code: "Enter" });

    expect(await screen.findByText("important")).toBeInTheDocument();
  });

  it("adds a todo", () => {
    renderWithSession(<NotesPage />);
    fireEvent.click(screen.getByText("+ New Note"));

    fireEvent.click(screen.getByText("+ Add Task"));
    expect(screen.getByPlaceholderText("To-do item")).toBeInTheDocument();
  });

  it("shows alert when trying to save without tags", () => {
    window.alert = jest.fn(); // mock alert

    renderWithSession(<NotesPage />);
    fireEvent.click(screen.getByText("+ New Note"));
    fireEvent.click(screen.getByText("Save"));

    expect(window.alert).toHaveBeenCalledWith("Please add at least one tag and press Enter before saving.");
  });
});
