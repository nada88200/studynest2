"use client";
import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Nav } from "@/Home/Navbar/Nav";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: true,
    showPersonalInfo: true,
    language: "English",
    theme: "normal",
  });

  const [profileImage, setProfileImage] = useState("/images/default-profile.jpeg");

  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
      }));
      setProfileImage(session.user?.profileImage || "/images/default-profile.jpeg");
    }
  }, [session]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setFormData((prev) => ({
        ...prev,
        theme: savedTheme,
      }));
  
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleSave = () => {
    console.log("Saving user data:", formData);
  
    // Apply theme
    if (formData.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  
    // Store in localStorage
    localStorage.setItem("theme", formData.theme);
  
   // router.push("/dashboard");
  };
  
  if (status === "loading") return <div>Loading...</div>;

  return (
    <div>
      <Nav />
      <div className="bg-gradient-to-br from-indigo-900 to-purple-800 dark:from-[#2d3748] dark:to-[#2d3748] min-h-screen w-full flex justify-center items-center px-4 py-10 pt-40">
        <main className="bg-white dark:bg-gray-900 p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-6xl overflow-auto">
          <h1 className="text-2xl font-semibold mb-6 text-center text-black dark:text-white">Update Your Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="flex flex-col gap-8">
              {/* Profile Picture */}
              <section className="p-6 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Profile Picture</h2>
                <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-2 border-gray-800">
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded cursor-pointer text-white text-sm">
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </section>

              {/* Change Password */}
              <section className="p-6 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Change Password</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input
                    name="currentPassword"
                    type="password"
                    placeholder="Current Password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                  />
                  <input
                    name="newPassword"
                    type="password"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                  />
                </div>
              </section>

              {/* Preferences */}
              <section className="p-6 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Language & Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full bg-gray-200 text-black px-4 py-2 rounded-md"
                  >
                    <option value="English">English</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                  <select
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="w-full bg-gray-200 text-black px-4 py-2 rounded-md"
                  >
                    <option value="normal">Normal Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8">
              {/* Basic Info */}
              <section className="p-6 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Basic Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                  />
                </div>
              </section>

              {/* Privacy Settings */}
              <section className="p-6 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Privacy Settings</h2>
                <label className="flex items-center text-black dark:text-white mb-2">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Enable Notifications
                </label>
                <label className="flex items-center text-black dark:text-white mb-2">
                  <input
                    type="checkbox"
                    name="showPersonalInfo"
                    checked={formData.showPersonalInfo}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Show Personal Information
                </label>
              </section>

              {/* Account Settings */}
              <section className="p-6 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Account Settings</h2>
                <div className="flex flex-col md:flex-row gap-6">
                  <button className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-md">
                    Delete Account
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="bg-gray-600 hover:bg-gray-800 text-white px-6 py-3 rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6">
            <button
              onClick={handleSave}
              className="bg-green-800 hover:bg-green-900 text-white font-bold px-8 py-4 rounded-md"
            >
              Save Changes
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-gray-900 dark:text-white text-lg text-center">
              If you are interested in our company and want to become a teacher, click the button below to apply.
            </p>
            <button
              onClick={() => router.push("/RequestTeacher")}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-md shadow-lg transform transition duration-300 hover:scale-105"
            >
              Become a Teacher
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
