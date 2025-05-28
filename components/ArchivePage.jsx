"use client";

import { useState, useEffect } from "react";
import { Nav } from "@/Home/Navbar/Nav";
import { useSession } from "next-auth/react";

export default function ArchivePage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState([]);
  const [tag, setTag] = useState("Uncategorized");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFiles();
    }
  }, [session]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/files");
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleTagChange = (e) => {
    setTag(e.target.value);
  };

 
  const handleBrowse = async (e) => {
    if (!session?.user?.id) return;
    const selectedFiles = Array.from(e.target.files);
  
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
        formData.append('tag', tag);
      });
  
      await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
  
      await fetchFiles();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  
  const handleDelete = async (index, fileId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this file?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/files?id=${fileId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete file");

      setFiles((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };


  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.preview;
    link.download = file.name;
    link.target = "_blank";
    link.click();
  };
  
  const handleOpen = (file) => {
    window.open(file.preview, "_blank");
  };
  
  const renderFilePreview = (file) => {
    if (file.type?.startsWith("image/")) {
      return (
        <img
          src={file.preview}
          alt={file.name}
          className="mt-2 rounded-md h-40 object-cover"
          onClick={() => handleOpen(file)}
        />
      );
    } else if (file.type?.startsWith("video/")) {
      return (
        <video
          controls
          src={file.preview}
          className="mt-2 rounded-md h-40 object-cover"
          onClick={() => handleOpen(file)}
        />
      );
    } else if (file.type === "application/pdf") {
      return (
        <div
          className="mt-2 rounded-md h-40 flex items-center justify-center bg-gray-700 cursor-pointer"
          onClick={() => handleOpen(file)}
        >
          📄 PDF File
        </div>
      );
    } else if (file.type?.startsWith("text/")) {
      return (
        <div
          className="mt-2 rounded-md h-40 flex items-center justify-center bg-gray-700 cursor-pointer"
          onClick={() => handleOpen(file)}
        >
          📝 Text File
        </div>
      );
    } else {
      return (
        <div
          className="mt-2 rounded-md h-40 flex items-center justify-center bg-gray-700 cursor-pointer"
          onClick={() => handleOpen(file)}
        >
          📁 File
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div>
        <Nav />
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="bg-gradient-to-br from-indigo-900 to-purple-800 dark:from-[#2d3748] dark:to-[#2d3748] min-h-screen w-full px-6 md:px-12 pt-[12vh] text-white">
        <h1 className="text-4xl font-bold mb-6 text-center">🗃️ My Archive</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
          <input
            type="text"
            value={tag}
            onChange={handleTagChange}
            placeholder="Enter category"
            className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-auto"
          />
          <label className="cursor-pointer bg-green-700 hover:bg-green-900 text-white px-6 py-2 rounded-lg transition-all">
            📂 Browse Files
            <input type="file" multiple className="hidden" onChange={handleBrowse} />
          </label>
        </div>

        {/* Render Files */}
        {files.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl">No files in your archive yet.</p>
            <p>Upload some files to get started!</p>
          </div>
        ) : (
          Object.entries(
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
                    {renderFilePreview(file)}
                    <div className="flex justify-between items-center mt-4 space-x-2">
                      <button onClick={() => handleOpen(file)} className="text-blue-300 hover:text-blue-500">Open</button>
                      <button onClick={() => handleDownload(file)} className="text-green-300 hover:text-green-500">Download</button>
                      <button onClick={() => handleDelete(index, file._id)} className="text-red-300 hover:text-red-500">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
