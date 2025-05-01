"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coursesData } from "@/data/data";
import { Nav } from "@/Home/Navbar/Nav";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import { FaStar, FaFile } from "react-icons/fa";
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
    slidesVideoFiles: [],
  });
  const [courses, setCourses] = useState([]);
  const [subscribedCourses, setSubscribedCourses] = useState([]);
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

  const handleFileChange = (e, type) => {
    const files = e.target.files;
    if (type === "slidesVideo") {
      setNewCourse((prev) => ({
        ...prev,
        slidesVideoFiles: [...prev.slidesVideoFiles, ...Array.from(files)],
        lessons: (prev.slidesVideoFiles.length + files.length).toString(),
      }));
    }
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    const newId = courses.length + 1;
    const course = { 
      ...newCourse,
      id: newId,
      lessons: newCourse.slidesVideoFiles.length.toString(),
      students: "0",  // default students
      reviewNumber: "0", // default reviews
    };
    setCourses((prev) => [...prev, course]);
    setNewCourse({
      title: "",
      category: "",
      price: "",
      author: "",
      lessons: "0",
      students: "",
      reviewNumber: "",
      image: "",
      slidesVideoFiles: [],
    });
  };

  const handleRemoveFile = (indexToRemove) => {
    setNewCourse((prev) => ({
      ...prev,
      slidesVideoFiles: prev.slidesVideoFiles.filter((_, index) => index !== indexToRemove),
    }));
  };

  const currentUserRole = session?.user?.role || "user";

  const handleDeleteCourse = (id) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  const handleSubscribe = (course) => {
    if (!subscribedCourses.find((c) => c.id === course.id)) {
      setSubscribedCourses((prev) => [...prev, course]);
    }
  };

  // Tutor's own uploaded courses
  const myUploadedCourses = courses.filter(
    (course) => course.author === session?.user?.name
  );


  const handleCardClick = () => {
    router.push("/individualcourse");
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
                {currentUserRole === "tutor"
                  ? myUploadedCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        currentUserRole={currentUserRole}
                      />
                    ))
                  : subscribedCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        currentUserRole={currentUserRole}
                      />
                    ))}
              </div>
            </div>
          )}

          {/* All Courses Section */}
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-6">All Courses</h1>

          {/* Tutor Form */}
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

                {/* Image File Input */}
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

                {/* Slides/Video File Input */}
                <div className="flex flex-col">
                  <label className="text-xl font-semibold mb-2">Slides / Video</label>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,video/*"
                    multiple
                    onChange={(e) => handleFileChange(e, "slidesVideo")}
                    className="p-3 bg-white/20 rounded-lg text-white hover:bg-white/30 transition duration-300 focus:outline-none focus:ring-4 focus:ring-purple-600 w-full file:mr-2 file:py-2 file:px-4 file:rounded-l-lg file:border file:border-transparent file:bg-purple-600 file:text-white file:font-semibold file:hover:bg-purple-700"
                  />
                  {newCourse.slidesVideoFiles.length > 0 && (
                    <div className="mt-4 p-2 border-2 border-white/40 rounded-lg">
                     <p className="text-white mb-2">Selected Slides/Video:</p>
                     <ul className="space-y-2">
                   {newCourse.slidesVideoFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-white/10 p-2 rounded">
                     <span>{file.name}</span>
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

          {/* Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                currentUserRole={currentUserRole}
                onDelete={() => handleDeleteCourse(course.id)}
                onSubscribe={() => handleSubscribe(course)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


const CourseCard = ({ course, currentUserRole, onDelete, onSubscribe }) => {
    const router = useRouter();

    return (
      <Tilt>
        <div className="bg-white rounded-lg overflow-hidden cursor-pointer shadow-lg relative"
        //  onClick={() => router.push("/individualarticle")}
        >
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
            <h1 className="ml-auto relative z-[10] h-20 w-20 flex items-center text-lg font-bold justify-center flex-col mt-[-4rem] rounded-full bg-rose-700 text-white">
              ${course.price}
            </h1>
  
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
  
            {/* Subscribe Button */}
            {currentUserRole === "user" && onSubscribe && (
              <button
                onClick={onSubscribe}
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
  