//components\CoursesPage.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/Home/Navbar/Nav";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import { FaStar, FaFile } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { useSession } from "next-auth/react";

const CourseCard = ({ course, currentUserRole, onDelete, onSubscribe, onClick }) => {
  const { data: session } = useSession();

  // Debug logs to help identify the issue
  console.log('Course data:', {
    courseId: course?._id,
    authorId: course?.author?._id,
    userId: session?.user?.id,
    currentUserRole,
    authorType: typeof course?.author?._id,
    userType: typeof session?.user?.id
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this course permanently?")) {
      onDelete();
    }
  };

  // Safest way to compare IDs
  const isOwner = course?.author?._id?.toString() === session?.user?.id;
  const showDeleteButton = currentUserRole === "admin" || 
                         (currentUserRole === "tutor" && isOwner);

  console.log('Delete button should show:', showDeleteButton);

  return (
    <Tilt>
      <div className="bg-white rounded-lg overflow-hidden cursor-pointer shadow-lg relative" onClick={onClick}>
        {showDeleteButton && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded z-10"
            aria-label="Delete course"
          >
            Delete
          </button>
        )}

        <div className="h-48 relative">
          <Image
            src={course.image || "/default-course.jpg"}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4">
          <div className="ml-auto relative z-[10] h-20 w-20 flex items-center text-lg font-bold justify-center flex-col mt-[-4rem] rounded-full bg-rose-700 text-white">
            ${course.price}
          </div>

          <div className="flex items-center mt-6 space-x-4">
            <span className="text-lg text-black text-opacity-70 font-bold">{course.category}</span>
            <span className="text-base text-gray-600">{course.author?.name || 'Unknown Author'}</span>
          </div>

          <h1 className="text-lg text-black font-bold mt-2">{course.title}</h1>

          <div className="flex items-center mt-2 space-x-2">
            <div className="flex items-center">
              {Array(5).fill(0).map((_, i) => (
                <FaStar key={i} className="w-4 h-4 text-yellow-600" />
              ))}
            </div>
            <span className="text-base text-orange-800 font-semibold">
              ({course.reviewNumber || 0} Reviews)
            </span>
          </div>

          <div className="mt-6 mb-6 w-full h-[2px] bg-gray-500 opacity-15"></div>

          <div className="flex mb-8 items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaFile className="w-4 h-4 text-orange-600" />
              <p className="text-base font-semibold text-gray-800">{course.lessons || 0} Lessons</p>
            </div>
            <div className="flex items-center space-x-2">
              <FaUserGroup className="w-4 h-4 text-orange-600" />
              <p className="text-base font-semibold text-gray-800">{course.students.length || 0} Students</p>
            </div>
          </div>

          {currentUserRole === "user" && onSubscribe && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubscribe();
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Subscribe
            </button>
          )}
        </div>
      </div>
    </Tilt>
  );
};

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "",
    price: 0,
    lessons: 0,
    image: "",
    slidesVideoFiles: [],
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses', {
          cache: 'no-store',
          next: { tags: ['courses'] }
        });
        
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses
    .filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(course => categoryFilter === "All" ? true : course.category === categoryFilter)
    .sort((a, b) => typeof a[sortBy] === "string" ? a[sortBy].localeCompare(b[sortBy]) : a[sortBy] - b[sortBy]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const files = e.target.files;
    if (type === "slidesVideo") {
      setNewCourse(prev => ({
        ...prev,
        slidesVideoFiles: [...prev.slidesVideoFiles, ...Array.from(files)],
        lessons: (prev.slidesVideoFiles.length + files.length).toString(),
      }));
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", newCourse.title);
      formData.append("category", newCourse.category);
      formData.append("price", newCourse.price);
      formData.append("lessons", newCourse.slidesVideoFiles.length);
      
      if (newCourse.imageFile) formData.append("image", newCourse.imageFile);
      
      newCourse.slidesVideoFiles.forEach(file => formData.append("slidesVideoFiles", file));

      const response = await fetch("/api/courses", { method: "POST", body: formData });
      if (!response.ok) throw new Error('Failed to add course');
      
      const result = await response.json();
      setCourses(prev => [...prev, result]);
      setNewCourse({ title: "", category: "", price: 0, image: "", slidesVideoFiles: [] });
      setShowAddCourseForm(false);
      alert("Course added successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setNewCourse(prev => ({
      ...prev,
      slidesVideoFiles: prev.slidesVideoFiles.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`/api/courses?id=${courseId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete course');
      setCourses(prev => prev.filter(course => course._id !== courseId));
      alert('Course deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSubscribe = async (courseId) => {
    try {
      const response = await fetch('/api/courses/enroll', {  // Changed from '/api/user/subscribe'
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enroll');
      }
  
      // Refresh the courses list and user data
      const [coursesResponse, userResponse] = await Promise.all([
        fetch('/api/courses', { cache: 'no-store' }),
        fetch(`/api/users/${session.user.id}`)
      ]);
  
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }
  
      alert('Successfully enrolled in the course!');
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const currentUserRole = session?.user?.role || "user";
  const myUploadedCourses = courses.filter(course => course.author?._id === session?.user?.id);

  return (
    <div>
      <Nav />
      <div className="pt-32 pb-16 relative bg-gradient-to-br from-indigo-900 to-purple-800 dark:from-[#2d3748] dark:to-[#2d3748] min-h-screen">
        <Image src="/images/cb.png" alt="bg image" width={800} height={800} className="absolute top-[30%] animate-bounce" />

        <div className="w-[80%] pt-8 pb-8 mx-auto relative z-10">
         {/* My Courses Section */}
{(currentUserRole === "user" || currentUserRole === "tutor") && (
  <div className="mb-16">
    <h1 className="text-4xl md:text-5xl text-white font-bold mb-6">
      {currentUserRole === "tutor" ? "My Created Courses" : "My Enrolled Courses"}
    </h1>

    {currentUserRole === "tutor" ? (
      /* Tutor's view - show created courses */
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {myUploadedCourses.length > 0 ? (
          myUploadedCourses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              currentUserRole={currentUserRole}
              onDelete={() => handleDeleteCourse(course._id)}
              onClick={() => router.push(`/courses/${course._id}`)}
              isEnrolled={false} // Tutors don't need enrollment status for their own courses

            />
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-xl text-white/80">
              You haven't created any courses yet.
            </p>
          </div>
        )}
      </div>
    ) : (
      /* User's view - show enrolled courses */
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {courses.filter(course => 
          session?.user?.userCourses?.some(
            enrolledId => enrolledId.toString() === course._id.toString()
          )
        ).length > 0 ? (
          courses
            .filter(course => 
              session?.user?.userCourses?.some(
                enrolledId => enrolledId.toString() === course._id.toString()
              )
            )
            .map(course => (
              <CourseCard
                key={course._id}
                course={course}
                currentUserRole={currentUserRole}
                onClick={() => router.push(`/courses/${course._id}`)}
              />
            ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-xl text-white/80">
              You haven't enrolled in any courses yet.
            </p>
          </div>
        )}
      </div>
    )}
  </div>
)}

          {/* All Courses Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl md:text-5xl text-white font-bold">All Courses</h1>
            {currentUserRole === "tutor" && (
              <button
                onClick={() => setShowAddCourseForm(!showAddCourseForm)}
                className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300"
              >
                {showAddCourseForm ? 'Cancel' : 'Add New Course'}
              </button>
            )}
          </div>

          {/* Tutor Form - Conditionally Rendered */}
          {currentUserRole === "tutor" && showAddCourseForm && (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-800 dark:from-[#2d3748] dark:to-[#2d3748] p-8 rounded-2xl shadow-2xl mb-12 text-white">
              <h2 className="text-4xl font-bold mb-8">Add New Course</h2>
              <form action="/api/courses" 
  method="POST" 
  encType="multipart/form-data" onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Course Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={newCourse.title}
                    onChange={handleInputChange}
                    placeholder="Enter Course Title"
                    className="p-4 rounded-lg w-full bg-white/10 text-white border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-purple-600 placeholder:text-white/70"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Category*</label>
                  <input
                    type="text"
                    name="category"
                    value={newCourse.category}
                    onChange={handleInputChange}
                    placeholder="Enter Category"
                    className="p-4 rounded-lg w-full bg-white/10 text-white border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-purple-600 placeholder:text-white/70"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Price*</label>
                  <input
                    type="number"
                    name="price"
                    value={newCourse.price}
                    onChange={handleInputChange}
                    placeholder="Enter Course Price"
                    className="p-4 rounded-lg w-full bg-white/10 text-white border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-purple-600 placeholder:text-white/70"
                    required
                    min="0"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Course Image*</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setNewCourse(prev => ({
                        ...prev,
                        imageFile: e.target.files[0],
                        image: URL.createObjectURL(e.target.files[0])
                      }));
                    }}
                    className="p-3 bg-white/20 rounded-lg text-white hover:bg-white/30 transition duration-300 focus:outline-none focus:ring-4 focus:ring-purple-600 w-full file:mr-2 file:py-2 file:px-4 file:rounded-l-lg file:border file:border-transparent file:bg-purple-600 file:text-white file:font-semibold file:hover:bg-purple-700"
                    required
                  />
                  {newCourse.image && (
                    <div className="mt-4 p-2 border-2 border-white/40 rounded-lg">
                      <img
                        src={newCourse.image}
                        alt="Course Preview"
                        className="w-40 h-40 object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Course Materials</label>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,video/*"
                    multiple
                    onChange={(e) => handleFileChange(e, "slidesVideo")}
                    className="p-3 bg-white/20 rounded-lg text-white hover:bg-white/30 transition duration-300 focus:outline-none focus:ring-4 focus:ring-purple-600 w-full file:mr-2 file:py-2 file:px-4 file:rounded-l-lg file:border file:border-transparent file:bg-purple-600 file:text-white file:font-semibold file:hover:bg-purple-700"
                  />
                  {newCourse.slidesVideoFiles.length > 0 && (
                    <div className="mt-4 p-2 border-2 border-white/40 rounded-lg">
                      <p className="text-white mb-2">Selected Files:</p>
                      <ul className="space-y-2">
                        {newCourse.slidesVideoFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-white/10 p-2 rounded">
                            <span className="truncate max-w-xs">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 hover:text-red-700 font-bold ml-4"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="col-span-2 flex justify-center mt-8">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 dark:from-[#1a202c] dark:to-[#1a202c] hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-xl transition duration-300 transform hover:scale-105"
                  >
                    Add Course
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <input
              type="text"
              placeholder="Search courses..."
              className="p-2 rounded text-black w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="p-2 rounded text-black"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Sort by Title</option>
              <option value="price">Sort by Price</option>
              <option value="students">Sort by Students</option>
            </select>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredCourses.map(course => (
              <CourseCard
                key={course._id}
                course={course}
                currentUserRole={currentUserRole}
                onDelete={() => handleDeleteCourse(course._id)}
                onSubscribe={() => handleSubscribe(course._id)}
                onClick={() => router.push(`/courses/${course._id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}