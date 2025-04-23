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


import Tilt from 'react-parallax-tilt';

import { FaArrowRight, FaAward } from "react-icons/fa";

export default function ArchivePage() {
    const [files, setFiles] = useState([]);
  const [tag, setTag] = useState("Uncategorized");
  const [customTags, setCustomTags] = useState(["Uncategorized"]);
const [activeTagFilter, setActiveTagFilter] = useState("Uncategorized"); // For filtering


  const handleTagChange = (e) => {
    setTag(e.target.value);
  };
  
  const handleAddTag = () => {
    if (tag.trim() && !customTags.includes(tag.trim())) {
      setCustomTags([...customTags, tag.trim()]);
    }
  };
  const handleBrowse = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const taggedFiles = selectedFiles.map((file) => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      tag,
    }));
    setFiles((prev) => [...prev, ...taggedFiles]);
  };

  const handleDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.preview;
    link.download = file.name;
    link.click();
  };

  const handleOpen = (file) => {
    window.open(file.preview, "_blank");
  };

    return (
        <div>
        <Nav />
        <div className="bg-gradient-to-br from-indigo-900 to-purple-800 dark:from-[#2d3748] dark:to-[#2d3748] min-h-screen w-full px-6 md:px-12 pt-[12vh] text-white">
        <h1 className="text-4xl font-bold mb-6 text-center">🗃️ Archive Manager</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
  <input
    type="text"
    value={tag}
    onChange={(e) => setTag(e.target.value)}
    placeholder="Enter category"
    className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-auto"
  />

  <label className="cursor-pointer bg-green-700 hover:bg-green-900 text-white px-6 py-2 rounded-lg transition-all">
    📂 Browse Files
    <input
      type="file"
      multiple
      className="hidden"
      onChange={handleBrowse}
    />
  </label>
</div>




     {/* Grouped Files Grid by Tag */}
{Object.entries(
  files.reduce((acc, file) => {
    if (!acc[file.tag]) acc[file.tag] = [];
    acc[file.tag].push(file);
    return acc;
  }, {})
).map(([tagName, taggedFiles]) => (
  <div key={tagName} className="mb-10">
    <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-600 pb-2">
      📁 {tagName}
    </h2>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {taggedFiles.map((file, index) => (
        <div
          key={index}
          className="bg-indigo-800 border border-indigo-600 rounded-xl p-4 flex flex-col justify-between shadow-lg"
        >
          <p className="font-semibold truncate">{file.name}</p>
          {file.file.type.startsWith("image/") && (
            <img
              src={file.preview}
              alt={file.name}
              className="mt-2 rounded-md h-40 object-cover"
              onClick={() => handleOpen(file)}
            />
          )}
          <div className="flex justify-between items-center mt-4 space-x-2">
            <button
              onClick={() => handleOpen(file)}
              className="text-blue-300 hover:text-blue-500 text-sm"
            >
              🔍 Open
            </button>
            <button
              onClick={() => handleDownload(file)}
              className="text-yellow-300 hover:text-yellow-500 text-sm"
            >
              ⬇ Download
            </button>
            <button
              onClick={() => handleDelete(index)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
))}

      </div>
      </div>
   
    );
    }