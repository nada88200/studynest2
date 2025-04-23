"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coursesData } from "@/data/data";
import { Nav } from "@/Home/Navbar/Nav";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import { FaStar } from "react-icons/fa";
import { FaFile } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { useSession } from "next-auth/react";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "",
    price: "",
    author: "",
    lessons: "",
    students: "",
    reviewNumber: "",
    image: "",
  });
  const [courses, setCourses] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setCourses(coursesData);
  }, []);

  const filteredCourses = courses
    .filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((course) =>
      categoryFilter === "All" ? true : course.category === categoryFilter
    )
    .sort((a, b) =>
      typeof a[sortBy] === "string"
        ? a[sortBy].localeCompare(b[sortBy])
        : a[sortBy] - b[sortBy]
    );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    const newId = courses.length + 1;
    const course = { ...newCourse, id: newId };
    setCourses((prev) => [...prev, course]);
    setNewCourse({
      title: "",
      category: "",
      price: "",
      author: "",
      lessons: "",
      students: "",
      reviewNumber: "",
      image: "",
    });
  };

  const currentUserRole = session?.user?.role || "user";
  const handleDeleteCourse = (id) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  return (
    <div>
      <Nav />
      <div className="pt-32 pb-16 relative bg-gradient-to-br from-indigo-900 to-purple-800 dark:from-[#2d3748] dark:to-[#2d3748] min-h-screen">
        <Image
          src="/images/cb.png"
          alt="bg image"
          width={800}
          height={800}
          className="absolute top-[30%] animate-bounce"
        />

        <div className="w-[80%] pt-8 pb-8 mx-auto relative z-10">
          {/* My Courses Section */}
          {(currentUserRole === "user" || currentUserRole === "tutor") && (
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl text-white font-bold mb-6">My Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {courses.length > 0 && <CourseCard course={courses[0]} />}
            </div>
          </div>
            )}
          {/* All Courses Section */}
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-6">All Courses</h1>

          {/* tutor Form */}
          {currentUserRole === "tutor" && (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-800 dark:from-[#2d3748] dark:to-[#2d3748] p-8 rounded-2xl shadow-2xl mb-12 text-white">
              <h2 className="text-4xl font-bold mb-8">Add New Course</h2>
              <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Course Title</label>
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
                  <label className="text-xl font-semibold mb-2">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={newCourse.author}
                    onChange={handleInputChange}
                    placeholder="Enter Author's Name"
                    className="p-4 rounded-lg w-full bg-white/10 text-white border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-purple-600 placeholder:text-white/70"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Category</label>
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
                  <label className="text-xl font-semibold mb-2">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={newCourse.price}
                    onChange={handleInputChange}
                    placeholder="Enter Course Price"
                    className="p-4 rounded-lg w-full bg-white/10 text-white border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-purple-600 placeholder:text-white/70"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Number of Lessons</label>
                  <input
                    type="number"
                    name="lessons"
                    value={newCourse.lessons}
                    onChange={handleInputChange}
                    placeholder="Enter Number of Lessons"
                    className="p-4 rounded-lg w-full bg-white/10 text-white border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-purple-600 placeholder:text-white/70"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Course Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        image: URL.createObjectURL(e.target.files[0]),
                      }))
                    }
                    className="p-3 bg-white/20 rounded-lg text-white hover:bg-white/30 transition duration-300 focus:outline-none focus:ring-4 focus:ring-purple-600"
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
                  <label className="text-xl font-semibold mb-2">Slides / Video</label>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      console.log("Slides/Video file:", file.name);
                    }}
                    className="p-3 bg-white/20 rounded-lg text-white hover:bg-white/30 transition duration-300 focus:outline-none focus:ring-4 focus:ring-purple-600"
                  />
                </div>
                <div className="col-span-2 flex justify-center mt-8">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 dark:from-[#1a202c] dark:to-[#1a202c] hover:to-indigo-700  text-white font-semibold py-3 px-6 rounded-lg shadow-xl transition duration-300 transform hover:scale-105"
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

          {/* Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredCourses.map((course) => (
            <CourseCard
             key={course.id}
             course={course}
             currentUserRole={currentUserRole}
             onDelete={() => handleDeleteCourse(course.id)}
                />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Course Card Component
const CourseCard = ({ course, currentUserRole, onDelete }) => {
  return (
    <Tilt>
      <div className="bg-white rounded-lg overflow-hidden cursor-pointer shadow-lg relative">
        {/* Admin Delete Button */}
        {currentUserRole === "admin" && (
          <button
            onClick={onDelete}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded"
          >
            Delete
          </button>
        )}

        {/* Image */}
        <div>
          <Image
            src={course.image}
            alt={course.title}
            width={400}
            height={400}
            className="w-full h-full"
          />
        </div>

        <div className="p-4">
          <h1 className="ml-auto relative z-[10] h-20 w-20 flex items-center text-lg font-bold justify-center 
                flex-col mt-[-4rem] rounded-full bg-rose-700 text-white">${course.price}</h1>

          <div className="flex items-center mt-6 space-x-4">
            <span className="text-lg text-black text-opacity-70 font-bold">{course.category}</span>
            <span className="text-base text-gray-600">{course.author}</span>
          </div>

          <h1 className="text-lg text-black font-bold mt-2">{course.title}</h1>

          <div className="flex items-center mt-2 space-x-2">
            <div className="flex items-center">
              {Array(5).fill(0).map((_, i) => (
                <FaStar key={i} className="w-4 h-4 text-yellow-600" />
              ))}
            </div>
            <span className="text-base text-orange-800 font-semibold">
              ({course.reviewNumber} Reviews)
            </span>
          </div>

          <div className="mt-6 mb-6 w-full h-[2px] bg-gray-500 opacity-15"></div>

          <div className="flex mb-8 items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaFile className="w-4 h-4 text-orange-600" />
              <p className="text-base font-semibold text-gray-800">{course.lessons} Lessons</p>
            </div>
            <div className="flex items-center space-x-2">
              <FaUserGroup className="w-4 h-4 text-orange-600" />
              <p className="text-base font-semibold text-gray-800">{course.students} Students</p>
            </div>
          </div>
        </div>
      </div>
    </Tilt>
  );
};
