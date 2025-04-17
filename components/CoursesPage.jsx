
// design 5
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coursesData } from "@/data/data"; // Replace with your actual path
import {Nav} from "@/Home/Navbar/Nav";

// Simulate current user role
const currentUserRole = "admin";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
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

  const router = useRouter();

  useEffect(() => {
    setCourses(coursesData);

    // Dummy user-specific courses
    setMyCourses([
      {
        id: 1,
        title: "React for Beginners",
        category: "Programming",
        price: 19.99,
        author: "John Doe",
        lessons: 10,
        students: 200,
        reviewNumber: 4.5,
        image: "https://via.placeholder.com/200",
      },
      {
        id: 2,
        title: "Advanced JavaScript",
        category: "Programming",
        price: 29.99,
        author: "Jane Smith",
        lessons: 15,
        students: 150,
        reviewNumber: 4.8,
        image: "https://via.placeholder.com/200",
      },
      {
        id: 3,
        title: "Web Design Fundamentals",
        category: "Design",
        price: 9.99,
        author: "Mark Lee",
        lessons: 12,
        students: 100,
        reviewNumber: 4.2,
        image: "https://via.placeholder.com/200",
      },
    ]);
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

  const categories = ["All", ...new Set(coursesData.map((c) => c.category))];

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = (e) => {
    e.preventDefault();

    const course = {
      ...newCourse,
      id: courses.length + 1,
    };

    setCourses((prevCourses) => [...prevCourses, course]);
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

  return (
    <div>
        <Nav />
    <div className="bg-indigo-950 text-white p-8 min-h-screen pt-20">
      <h1 className="text-4xl font-bold mb-8">All Courses</h1>

      {/* <div className="flex justify-end mb-6">
        <button
          onClick={handleBack}
          className="bg-gray-700 hover:bg-gray-900 text-white font-bold px-6 py-3 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div> */}

      {currentUserRole === "admin" && (
        <div className="bg-white text-black p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Course</h2>
          <form onSubmit={handleAddCourse}>
            <div className="flex flex-col gap-4">
              {[
                { name: "title", placeholder: "Course Title" },
                { name: "author", placeholder: "Author" },
                { name: "category", placeholder: "Category" },
                { name: "price", placeholder: "Price", type: "number" },
                { name: "lessons", placeholder: "Lessons", type: "number" },
                { name: "students", placeholder: "Students", type: "number" },
                { name: "reviewNumber", placeholder: "Reviews", type: "number" },
                { name: "image", placeholder: "Image URL" },
              ].map(({ name, placeholder, type = "text" }) => (
                <input
                  key={name}
                  type={type}
                  name={name}
                  value={newCourse[name]}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  className="p-2 rounded text-black"
                  required
                />
              ))}

              <button
                type="submit"
                className="mt-4 bg-green-700 hover:bg-green-900 text-white font-bold px-6 py-3 rounded-lg"
              >
                Add Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Courses */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">My Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
        <select
          className="p-2 rounded text-black"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* All Courses */}
      <h2 className="text-3xl font-semibold mb-4">All Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
    </div>
  );
}

// Reusable Course Card
const CourseCard = ({ course }) => (
  <div className="bg-white text-black rounded-lg overflow-hidden shadow-lg">
    <img
      src={course.image}
      alt={course.title}
      className="w-full h-40 object-cover"
    />
    <div className="p-4">
      <h2 className="text-xl font-semibold">{course.title}</h2>
      <p className="text-gray-700 mb-2">By {course.author}</p>
      <p className="text-sm mb-1">Category: {course.category}</p>
      <p className="text-sm">Lessons: {course.lessons}</p>
      <p className="text-sm">Students: {course.students}</p>
      <p className="text-sm">Reviews: {course.reviewNumber}</p>
      <p className="text-lg font-bold mt-2">${course.price}</p>
      <button className="mt-4 bg-blue-700 hover:bg-blue-900 px-4 py-2 text-white rounded">
        View Details
      </button>
    </div>
  </div>
  
);
const addCourse = async () => {
  const courseData = {
    title: "Advanced React",
    description: "Learn advanced concepts of React",
    category: "Development",
    instructor: "instructorId",  // Replace with a valid ObjectId of a user
    duration: "4 weeks",
    level: "advanced",
    price: 100,
    language: "English",
    materials: [
      {
        title: "React Video 1",
        type: "video",
        url: "https://example.com/video1"
      }
    ]
  };

  try {
    const response = await fetch("http://localhost:3000/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Course added:", data);
    } else {
      console.log("Error:", data.message);
    }
  } catch (error) {
    console.error("Error adding course:", error);
  }
};

// Call addCourse function to send the request
addCourse();
