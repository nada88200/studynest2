
//app\courses\[id]\page.js
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Nav } from "@/Home/Navbar/Nav";
import { FaStar, FaFilePdf, FaFilePowerpoint, FaFileVideo, FaLock } from "react-icons/fa";
import { FaUserGroup, FaArrowLeft } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import Link from "next/link"; 
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const CourseDetailsPage = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("slides");
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(null);
// Add these states
const [userRating, setUserRating] = useState(0);
const [hoverRating, setHoverRating] = useState(0);
const [isRatingLoading, setIsRatingLoading] = useState(false);
const [ratingSuccess, setRatingSuccess] = useState(null);


// Add this effect to check if user already rated
useEffect(() => {
  if (course?.ratings && session?.user?.id) {
    const userRatingObj = course.ratings.find(r => 
      r.user.toString() === session.user.id
    );
    setUserRating(userRatingObj?.rating || 0);
  }
}, [course, session]);

// Add this function to handle rating
const handleRateCourse = async (rating) => {
  if (!isEnrolled || isRatingLoading) return;
  
  setIsRatingLoading(true);
    setRatingSuccess(null); // Reset any previous success message

  try {
    const response = await fetch(`/api/courses/${id}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to submit rating');
    }

    // Show success message
    setRatingSuccess(`You rated this course ${rating} star${rating !== 1 ? 's' : ''}!`);
    
    // Refresh course data
    const refreshResponse = await fetch(`/api/courses/${id}`);
    if (refreshResponse.ok) {
      const newData = await refreshResponse.json();
      setCourse(newData.course);
    }
    // Clear success message after 3 seconds
    setTimeout(() => {
      setRatingSuccess(null);
    }, 3000);
  } catch (err) {
    console.error('Rating error:', err);
    alert(`Error: ${err.message}`);
  } finally {
    setIsRatingLoading(false);
  }
};
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  } 
  // Add this function inside your component
const calculateTotalLessons = () => {
  const slidesCount = slides.length;
  const videosCount = videos.length;
  return slidesCount + videosCount;
}; 

  const checkEnrollment = async () => {
    if (!session?.user?.id) return false;
    
    try {
      const response = await fetch(`/api/users/${session.user.id}/is-enrolled?courseId=${id}`);
      if (!response.ok) throw new Error('Failed to check enrollment');
      const data = await response.json();
      return data.isEnrolled;
    } catch (err) {
      console.error('Enrollment check error:', err);
      return false;
    }
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) throw new Error('Failed to fetch course details');
        const data = await response.json();
        setCourse(data.course);
        
        const enrolled = await checkEnrollment();
        setIsEnrolled(enrolled);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, session]);

  const handleEnroll = async () => {
    if (!session) {
      setEnrollmentError('Please sign in to enroll');
      return;
    }
    
    if (isEnrolled) {
      setEnrollmentError('You are already enrolled in this course');
      return;
    }

    setIsEnrolling(true);
    setEnrollmentError(null);
    
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          courseId: id,
          userId: session.user.id
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Enrollment failed');
      }

      setIsEnrolled(true);
      
      const refreshResponse = await fetch(`/api/courses/${id}`, {
        cache: 'no-store'
      });
      if (refreshResponse.ok) {
        const newData = await refreshResponse.json();
        setCourse(newData.course);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setEnrollmentError(err.message);
    } finally {
      setIsEnrolling(false);
    }
  };
// Add this function to your CourseDetailsPage component
const handleUnenroll = async () => {
  if (!session) {
    setEnrollmentError('Please sign in to unenroll');
    return;
  }
  
  if (!isEnrolled) {
    setEnrollmentError('You are not enrolled in this course');
    return;
  }

  setIsEnrolling(true);
  setEnrollmentError(null);
  
  try {
    const response = await fetch('/api/courses/unenroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        courseId: id,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Unenrollment failed');
    }

    setIsEnrolled(false);
    
    // Refresh course data
    const refreshResponse = await fetch(`/api/courses/${id}`, {
      cache: 'no-store'
    });
    if (refreshResponse.ok) {
      const newData = await refreshResponse.json();
      setCourse(newData.course);
    }
  } catch (err) {
    console.error('Unenrollment error:', err);
    setEnrollmentError(err.message);
  } finally {
    setIsEnrolling(false);
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
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

const slides = course?.slidesVideoFiles?.filter(file => 
    file.type === 'pdf' || file.type === 'photo' || file.type === 'document'
  ) || [];

  const videos = course?.slidesVideoFiles?.filter(file => 
    file.type === 'video' || file.type === 'mp4' || file.type === 'mov'
  ) || [];


  return (
    <div>
      <Nav />
      <div className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="w-[90%] mx-auto">
          <button 
            onClick={() => window.history.back()}
            className="mb-8 flex items-center text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
          >
            <FaArrowLeft className="mr-2" /> Back to Courses
          </button>

          {/* Course Header */}
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            <div className="w-full lg:w-1/2 h-96 relative rounded-xl overflow-hidden shadow-xl">
              <Image
                src={course.image || "/default-course.jpg"}
                alt={course.title || "Course image"}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="w-full lg:w-1/2">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{course.title}</h1>
              <div className="flex items-center mb-6">
                {/* <div className="flex items-center mr-6">
                  {Array(5).fill(0).map((_, i) => (
                    <FaStar key={i} className="w-5 h-5 text-yellow-500" />
                  ))}
                  <span className="ml-2 text-gray-700 dark:text-gray-300">({course.reviewNumber || 0})</span>
                </div> */}

                <div className="flex items-center mr-6">
  {Array(5).fill(0).map((_, i) => {
    const ratingValue = i + 1;
    const averageRating = course.averageRating || 0;
    
    return (
      <button
        key={i}
        type="button"
        className={`w-5 h-5 ${
          // Show yellow if:
          // - It's being hovered (and not loading)
          // - OR user has rated this value (and not hovering something else)
          // - OR it's below the average rating (when not hovering)
          (hoverRating >= ratingValue || 
          (!hoverRating && userRating >= ratingValue) ||
          (!hoverRating && averageRating >= ratingValue))
          ? 'text-yellow-500' 
          : 'text-gray-300'
        } ${isRatingLoading ? 'opacity-50' : ''}`}
        onClick={() => handleRateCourse(ratingValue)}
        onMouseEnter={() => isEnrolled && !isRatingLoading && setHoverRating(ratingValue)}
        onMouseLeave={() => isEnrolled && !isRatingLoading && setHoverRating(0)}
        disabled={!isEnrolled || isRatingLoading}
        title={isEnrolled ? `Rate ${ratingValue} star${ratingValue !== 1 ? 's' : ''}` : 'Enroll to rate'}
      >
        <FaStar />
      </button>
    );
  })}
  <span className="ml-2 text-gray-700 dark:text-gray-300">
    ({course.reviewNumber || 0} {course.reviewNumber === 1 ? 'review' : 'reviews'})
  </span>
  {isRatingLoading && (
    <span className="ml-2 text-sm text-gray-500">Saving...</span>
  )}
  {ratingSuccess && (
    <span className="ml-2 text-sm text-green-600 dark:text-green-400">
      {ratingSuccess}
    </span>
  )}
</div>
               {/* <div className="flex items-center mr-6">
  {Array(5).fill(0).map((_, i) => {
    const ratingValue = i + 1;
    return (
      <button
        key={i}
        type="button"
        className={`w-5 h-5 ${
          // Show yellow if:
          // - It's being hovered (and not loading)
          // - OR user has rated this value (and not hovering something else)
          // - OR it's below the user's rating (when not hovering)
          (hoverRating >= ratingValue || 
          (!hoverRating && userRating >= ratingValue))
          ? 'text-yellow-500' 
          : 'text-gray-300'
        } ${isRatingLoading ? 'opacity-50' : ''}`}
        onClick={() => handleRateCourse(ratingValue)}
        onMouseEnter={() => isEnrolled && !isRatingLoading && setHoverRating(ratingValue)}
        onMouseLeave={() => isEnrolled && !isRatingLoading && setHoverRating(0)}
        disabled={!isEnrolled || isRatingLoading}
        title={isEnrolled ? `Rate ${ratingValue} star${ratingValue !== 1 ? 's' : ''}` : 'Enroll to rate'}
      >
        <FaStar />
      </button>
    );
  })}
  <span className="ml-2 text-gray-700 dark:text-gray-300">
    ({course.reviewNumber || 0} {course.reviewNumber === 1 ? 'review' : 'reviews'})
  </span>
  {isRatingLoading && (
    <span className="ml-2 text-sm text-gray-500">Saving...</span>
  )}
  {ratingSuccess && (
    <span className="ml-2 text-sm text-green-600 dark:text-green-400">
      {ratingSuccess}
    </span>
  )}
</div> */}
{/* <div className="flex items-center mr-6">
  {Array(5).fill(0).map((_, i) => {
    const ratingValue = i + 1;
    return (
      <button
        key={i}
        type="button"
        className={`w-5 h-5 ${(hoverRating || userRating || course.averageRating || 0) >= ratingValue ? 'text-yellow-500' : 'text-gray-300'} ${isRatingLoading ? 'opacity-50' : ''}`}
        onClick={() => handleRateCourse(ratingValue)}
        onMouseEnter={() => isEnrolled && !isRatingLoading && setHoverRating(ratingValue)}
        onMouseLeave={() => isEnrolled && !isRatingLoading && setHoverRating(0)}
        disabled={!isEnrolled || isRatingLoading}
        title={isEnrolled ? `Rate ${ratingValue} star${ratingValue !== 1 ? 's' : ''}` : 'Enroll to rate'}
      >
        <FaStar />
      </button>
    );
  })}
  <span className="ml-2 text-gray-700 dark:text-gray-300">
    ({course.reviewNumber || 0} {course.reviewNumber === 1 ? 'review' : 'reviews'})
  </span>
  {isRatingLoading && (
    <span className="ml-2 text-sm text-gray-500">Saving...</span>
  )}
</div> */}
                <div 
                  className="flex items-center cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  onClick={() => setShowStudentsModal(true)}
                >
                  <FaUserGroup className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{course.students?.length || 0} students</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">${course.price}</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
                    {course.category}
                  </span>
                </div>
                
                       {/* Students Modal */}
{showStudentsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Enrolled Students ({course.students?.length || 0})
        </h3>
        <button 
          onClick={() => setShowStudentsModal(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      
      <div className="overflow-y-auto p-4">
        {course.students?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {course.students.map(student => (
              <div 
                key={student._id} 
                className="flex items-center space-x-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <div 
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ backgroundColor: student.color || 'gray' }} // Use student's color or fallback to gray
                >
                  <img 
                    src={student.photo || '/default-avatar.jpg'} 
                    alt={student.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No students enrolled yet
          </p>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
        <button
          onClick={() => setShowStudentsModal(false)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}{/* Replace the existing enrollment button section with this */}
{session?.user?.id !== course.author._id.toString() && (
  <div className="flex flex-col gap-2">
    {!isEnrolled ? (
      <>
        <button 
          onClick={handleEnroll}
          disabled={isEnrolling}
          className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ${
            isEnrolling ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
        {enrollmentError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {enrollmentError}
          </p>
        )}
      </>
    ) : (
      <div className="flex flex-col gap-2">
        <div className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-center">
          You're enrolled!
        </div>
        <button
          onClick={handleUnenroll}
          disabled={isEnrolling}
          className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ${
            isEnrolling ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isEnrolling ? 'Processing...' : 'Unenroll'}
        </button>
      </div>
    )
    }
    
  </div>
)}
{/* Owner message (only shown to course owner) */}
  {session?.user?.id === course.author._id.toString() && (
    <div className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-center">
      This is your course
    </div>
  )}
              </div>
              
              <div className="flex items-center text-gray-700 dark:text-gray-300">
  <span className="font-semibold mr-2">Lessons:</span>
  <span>{calculateTotalLessons()}</span>
</div>

            </div>
          </div>
{/* Edit Button (only shown to course owner) */}
{session?.user?.id === course.author._id.toString() && (
  <div className="flex justify-end mb-4">
    <Link 
      href={`/courses/${id}/edit`}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
    >
      Edit Course
    </Link>
  </div>
)}
           {/* Course Content */}
      <div className="mb-12">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            className={`py-3 px-6 font-medium ${activeTab === "slides" ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
            onClick={() => setActiveTab("slides")}
          >
            Slides & Photos ({slides.length})
          </button>
          <button
            className={`py-3 px-6 font-medium ${activeTab === "videos" ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
            onClick={() => setActiveTab("videos")}
          >
            Videos ({videos.length})
          </button>
        </div>
        
        {!isEnrolled ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <FaLock className="w-16 h-16 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Content Locked
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enroll in this course to access all slides, videos, and materials
              </p>
              <button 
                onClick={handleEnroll}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Enroll Now
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "slides" && (
              <div>
                {slides.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slides.map((file, index) => (
                      <div 
                        key={index} 
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer"
                        onClick={() => setCurrentFileIndex(index)}
                      >
                        <div className="p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 h-48">
                          {file.type === 'pdf' ? (
                            <div className="text-center">
                              <FaFilePdf className="w-16 h-16 text-red-500 mx-auto mb-2" />
                              <p className="text-sm text-gray-700 dark:text-gray-300">PDF Document</p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentFileIndex(index);
                                }}
                                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                              >
                                Open PDF
                              </button>
                            </div>
                          ) : (
                            <img 
                              src={file.url} 
                              alt="Course content" 
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {file.name || (file.type === 'pdf' ? 'PDF Document' : 'Photo')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{file.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">No slides or photos available</p>
                )}
              </div>
            )}
                
                {activeTab === "videos" && (
                  <div>
                    {videos.length > 0 ? (
                      <div className="grid grid-cols-1 gap-8">
                        {videos.map((video, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                            <div className="relative pt-[56.25%] bg-black">
                              <video
                                controls
                                className="absolute top-0 left-0 w-full h-full"
                              >
                                <source src={video.url} type={`video/${video.url.split('.').pop()}`} />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 dark:text-white">Video Lesson {index + 1}</h3>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-12">No videos available</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
 {/* PDF Viewer Modal */}
      {isEnrolled && currentFileIndex !== null && activeTab === "slides" && slides[currentFileIndex]?.type === 'pdf' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {slides[currentFileIndex].name || 'PDF Document'}
              </h3>
              <div className="flex gap-2">
                <a 
                  href={slides[currentFileIndex].url}
                  download
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
                <button 
                  onClick={() => setCurrentFileIndex(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <div className="w-full h-full overflow-auto">
                <Document
                  file={slides[currentFileIndex].url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="text-center py-8">Loading PDF...</div>}
                  error={<div className="text-center py-8 text-red-500">Failed to load PDF</div>}
                  className="pdf-viewer"
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page 
                      key={`page_${index + 1}`} 
                      pageNumber={index + 1} 
                      width={800}
                      className="mb-4"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  ))}
                </Document>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentFileIndex(prev => (prev > 0 ? prev - 1 : slides.length - 1))}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={slides.length <= 1}
              >
                Previous
              </button>
              
              <span className="text-gray-700 dark:text-gray-300">
                {currentFileIndex + 1} of {slides.length}
              </span>
              
              <button
                onClick={() => setCurrentFileIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0))}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={slides.length <= 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
          {/* File Viewer Modal */}
      {isEnrolled && currentFileIndex !== null && activeTab === "slides" && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {slides[currentFileIndex].type === 'pdf' ? 'PDF Document' : 
           slides[currentFileIndex].type === 'video' ? 'Video' : 'Photo'}
        </h3>
        <div className="flex gap-2">
          <a 
            href={slides[currentFileIndex].url}
            download
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          <button 
            onClick={() => setCurrentFileIndex(null)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-lg">
          <button 
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
            className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
            className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button 
            onClick={() => setZoom(1)}
            className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-xs"
          >
            Reset
          </button>
        </div>

        {slides[currentFileIndex].type === 'pdf' ? (
          <div className="w-full h-full overflow-auto">
            <Document
              file={slides[currentFileIndex].url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="text-center py-8">Loading PDF...</div>}
              error={<div className="text-center py-8 text-red-500">Failed to load PDF</div>}
              className="pdf-viewer"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                  width={800 * zoom}
                  className="mb-4"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))}
            </Document>
          </div>
        ) : slides[currentFileIndex].type === 'video' ? (
          <div className="w-full max-w-4xl">
            <video
              controls
              className="w-full"
              style={{ transform: `scale(${zoom})` }}
            >
              <source src={slides[currentFileIndex].url} type={`video/${slides[currentFileIndex].url.split('.').pop()}`} />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="overflow-auto max-w-full max-h-[70vh]">
            <img 
              src={slides[currentFileIndex].url} 
              alt="Course content" 
              className="object-contain"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setCurrentFileIndex(prev => (prev > 0 ? prev - 1 : slides.length - 1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          disabled={slides.length <= 1}
        >
          Previous
        </button>
        
        <span className="text-gray-700 dark:text-gray-300">
          {currentFileIndex + 1} of {slides.length}
        </span>
        
        <button
          onClick={() => setCurrentFileIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          disabled={slides.length <= 1}
        >
          Next
        </button>
      </div>
    </div>
  </div>
)}
{/* Students Modal */}
{showStudentsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Enrolled Students ({course.students?.length || 0})
        </h3>
        <button 
          onClick={() => setShowStudentsModal(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      
      <div className="overflow-y-auto p-4">
        {course.students?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {course.students.map(student => (
              <div 
                key={student._id} 
                className="flex items-center space-x-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="relative w-12 h-12">
                  <Image
                    src={student.photo || '/default-avatar.jpg'}
                    alt={student.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {student.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {student.email || ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No students enrolled yet
          </p>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
        <button
          onClick={() => setShowStudentsModal(false)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;