//app\courses\[id]\edit\page.js
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Nav } from "@/Home/Navbar/Nav";
import { FaArrowLeft, FaSave, FaTrash } from "react-icons/fa";
import { FaPlus } from 'react-icons/fa';
import { FaFileImage } from "react-icons/fa";
import { FaFilePdf, FaFileVideo } from 'react-icons/fa';


const EditCoursePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: 0,
    lessons: 0,
    description: "",
     slidesVideoFiles: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
 const fetchCourse = async () => {
    if (!session) return; // Add this line
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      const data = await response.json();
      
      if (data.course.author._id.toString() !== session?.user?.id) {
        router.push('/');
        return;
      }
      
      setCourse(data.course);
      setFormData({
        title: data.course.title,
        category: data.course.category,
        price: data.course.price,
       // lessons: data.course.lessons,
        description: data.course.description || "",
        slidesVideoFiles: data.course.slidesVideoFiles || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (session) fetchCourse();
}, [id, session]);

const handleFileChange = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  setIsSubmitting(true);
  setError(null);
  
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - the browser will set it automatically
      // with the correct boundary for FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload files');
    }

    const uploadedFiles = await response.json();
    
    setFormData(prev => ({
      ...prev,
      slidesVideoFiles: [...prev.slidesVideoFiles, ...uploadedFiles]
    }));
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};

const handleRemoveFile = (index) => {
  setFormData(prev => ({
    ...prev,
    slidesVideoFiles: prev.slidesVideoFiles.filter((_, i) => i !== index)
  }));
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'lessons' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setIsSubmitting(true);
  
  try {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update course');
    }
    
    router.push(`/courses/${id}`);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="text-xl font-bold">Error loading course</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-xl font-bold">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="w-[90%] mx-auto">
          <button 
            onClick={() => router.back()}
            className="mb-8 flex items-center text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
          >
            <FaArrowLeft className="mr-2" /> Back to Course
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Edit Course</h1>
          
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">
                  Course Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="category">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="price">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              {/* <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="lessons">
                  Number of Lessons
                </label>
                <input
                  type="number"
                  id="lessons"
                  name="lessons"
                  value={formData.lessons}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div> */}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="mb-6">
    <label className="block text-gray-700 dark:text-gray-300 mb-2">
      Course Materials (Slides & Videos)
    </label>
    
    <div className="mb-4">
      <input
        type="file"
        id="files"
        name="files"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov,.avi"
      />
      <label
        htmlFor="files"
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center cursor-pointer"
      >
        <FaPlus className="mr-2" /> Add Files
      </label>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Upload PDFs, images, or video files
      </p>
    </div>

    {formData.slidesVideoFiles.length > 0 && (
      <div className="space-y-2">
        {formData.slidesVideoFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center">
              {file.type === 'pdf' ? (
  <FaFilePdf className="text-red-500 mr-2" />
) : file.type === 'video' ? (
  <FaFileVideo className="text-blue-500 mr-2" />
) : (
  <FaFileImage className="text-green-500 mr-2" />
)}
              <span className="truncate max-w-xs">{file.url.split('/').pop()}</span>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveFile(index)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push(`/courses/${id}`)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                <FaSave /> {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCoursePage;