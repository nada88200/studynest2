"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Nav } from "@/Home/Navbar/Nav";
import Image from "next/image";
import Link from "next/link";
import React,{useState,useEffect} from "react";
import { navLinks } from "@/constant/constant";
import {Hero} from '@/Home/Hero/Hero';
import { HeroContent } from "@/Home/Hero/HeroContent";
import { HeroImage } from "@/Home/Hero/HeroImage";
import { About } from "@/Home/About/About";
import { FiPlus, FiCheckCircle, FiCircle } from "react-icons/fi";

import { FaTrash } from "react-icons/fa";



import Tilt from 'react-parallax-tilt';
import { FaCheckCircle } from "react-icons/fa";
import { FaArrowRight, FaAward } from "react-icons/fa";
import { FiX } from "react-icons/fi";



export default function NotesPage() {
  
    const [notes, setNotes] = useState([]);
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
    const [noteForm, setNoteForm] = useState({
      title: "",
      content: "",
      todos: [],
      tags: [],
      files: [],
    });
    const [searchTerm, setSearchTerm] = useState("");
  
    const resetForm = () => {
      setNoteForm({ title: "", content: "", todos: [], tags: [], files: [] });
      setSelectedNoteIndex(null);
    };
  
    const handleSaveNote = () => {
      if (!noteForm.title.trim()) return;
  
      const newNote = { ...noteForm };
  
      if (selectedNoteIndex !== null) {
        const updatedNotes = [...notes];
        updatedNotes[selectedNoteIndex] = newNote;
        setNotes(updatedNotes);
      } else {
        setNotes([...notes, newNote]);
      }
  
      resetForm();
    };
  
    const handleFileChange = (e) => {
      const newFiles = Array.from(e.target.files);
      setNoteForm((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles],
      }));
    };
  
    const handleAddTodo = () => {
      setNoteForm((prev) => ({
        ...prev,
        todos: [...prev.todos, { text: "", completed: false }],
      }));
    };
  
    const handleTodoChange = (index, text) => {
      const updatedTodos = [...noteForm.todos];
      updatedTodos[index].text = text;
      setNoteForm((prev) => ({ ...prev, todos: updatedTodos }));
    };
  
    const toggleTodo = (index) => {
      const updatedTodos = [...noteForm.todos];
      updatedTodos[index].completed = !updatedTodos[index].completed;
      setNoteForm((prev) => ({ ...prev, todos: updatedTodos }));
    };
  
    const handleEditNote = (index) => {
      setNoteForm(notes[index]);
      setSelectedNoteIndex(index);
    };
  
    const handleDeleteNote = (index) => {
      const updatedNotes = [...notes];
      updatedNotes.splice(index, 1);
      setNotes(updatedNotes);
      if (selectedNoteIndex === index) resetForm();
    };
  
    const handleTagKeyDown = (e) => {
      const value = e.target.value.trim();
      if (e.key === "Enter" && value) {
        e.preventDefault();
        if (!noteForm.tags.includes(value)) {
          setNoteForm((prev) => ({
            ...prev,
            tags: [...prev.tags, value],
          }));
        }
        e.target.value = ""; // Clear the input
      }
    };
  
    const filteredNotes = notes.filter((note) =>
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ) || note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const groupNotesByTag = (notes) => {
      const grouped = {};
      notes.forEach((note) => {
        note.tags.forEach((tag) => {
          if (!grouped[tag]) {
            grouped[tag] = [];
          }
          grouped[tag].push(note);
        });
      });
      return grouped;
    };
  
    const groupedNotes = groupNotesByTag(filteredNotes);
  
    return (
        <div >
        <Nav />
      <div className="h-[calc(100vh-70px)] w-full  text-white bg-gradient-to-br from-indigo-900 to-purple-800 pt-[12vh] min-h-screen">
        <div className="flex h-full overflow-hidden">
          {/* Sidebar */}
          <div className="w-[300px] flex-shrink-0 bg-white bg-opacity-5 backdrop-blur-lg border-r border-white/20 p-5 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Notes</h2>
              <button
                onClick={resetForm}
                className="px-3 py-1 bg-white text-black text-sm rounded hover:bg-gray-200"
              >
                + New Note
              </button>
            </div>
  
            {/* Search bar */}
            <div>
              <input
                type="text"
                placeholder="Search by tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mt-2 rounded-lg bg-white bg-opacity-20 text-black placeholder-black/60 focus:outline-none"
              />
            </div>
  
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {Object.keys(groupedNotes).map((tag) => (
                <div key={tag}>
                  <h3 className="text-sm font-semibold text-blue-300 mb-1">{tag}</h3>
                  {groupedNotes[tag].map((note, index) => {
                    const globalIndex = notes.findIndex(
                      (n) => n.title === note.title && n.content === note.content
                    );
                    return (
                      <div
                        key={index}
                        className={`flex justify-between items-start p-2 rounded-lg cursor-pointer transition hover:bg-white hover:bg-opacity-10 ${
                          selectedNoteIndex === globalIndex ? "bg-white bg-opacity-10" : ""
                        }`}
                        onClick={() => handleEditNote(globalIndex)}
                      >
                        <div>
                          <p className="font-medium truncate">{note.title}</p>
                          <p className="text-xs opacity-70">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(globalIndex);
                          }}
                          className="text-red-300 hover:text-red-500"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
  
          {/* Editor Panel */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-l-3xl shadow-inner">
            <input
              type="text"
              placeholder="Note Title"
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-black font-semibold placeholder-black/60 focus:outline-none"
              value={noteForm.title}
              onChange={(e) =>
                setNoteForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
  
            <textarea
              placeholder="Write your note here..."
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-black placeholder-black/60 focus:outline-none min-h-[100px] max-h-[300px] overflow-y-auto"
              value={noteForm.content}
              onChange={(e) =>
                setNoteForm((prev) => ({ ...prev, content: e.target.value }))
              }
            />
  
            {/* Tags */}
            <div>
              <p className="font-semibold mb-2">Tags</p>
              <div className="space-x-2 flex flex-wrap">
                {noteForm.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add Tags (press Enter)"
                className="w-full p-3 mt-2 rounded-lg bg-white bg-opacity-20 text-black placeholder-black/60 focus:outline-none"
                onKeyDown={handleTagKeyDown}
              />
            </div>
  
            {/* To-do List */}
            <div>
              <p className="font-semibold mb-2">✅ To-Do List</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {noteForm.todos.map((todo, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <button
                      className={`mt-1 w-5 h-5 rounded-full border-2 shrink-0 ${
                        todo.completed
                          ? "bg-green-500 border-green-600"
                          : "border-gray-300"
                      }`}
                      onClick={() => toggleTodo(index)}
                    />
                    <textarea
                      className="flex-1 p-1 rounded bg-white bg-opacity-20 text-white placeholder-white focus:outline-none resize-none overflow-hidden"
                      placeholder="To-do item"
                      value={todo.text}
                      onChange={(e) => handleTodoChange(index, e.target.value)}
                      rows={1}
                    />
                  </div>
                ))}
                <button
                  onClick={handleAddTodo}
                  className="text-sm text-blue-200 hover:text-blue-100"
                >
                  + Add Task
                </button>
              </div>
            </div>
  
            {/* File Upload */}
            <div className="space-y-2">
              <p className="font-semibold">📎 Attach Files</p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="text-white"
              />
              <div className="max-h-40 overflow-y-auto grid gap-2">
                {noteForm.files.map((file, idx) => (
                  <a
                    key={idx}
                    href={URL.createObjectURL(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-200 hover:underline truncate"
                  >
                    {file.name}
                  </a>
                ))}
              </div>
            </div>
  
            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}
