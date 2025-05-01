"use client";
import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Nav } from "@/Home/Navbar/Nav";
import {
  FaSignOutAlt,
  FaTrash,
  FaChalkboardTeacher,
} from "react-icons/fa";

export default function SettingsPage() {
  const { data: session, update, status } = useSession();
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
      }));

      if (session.user?.photo) {
        setProfileImage(session.user.photo); // use whatever photo URL is stored in session
      }           
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const response = await fetch("/api/upload-profile-image", {
        method: "POST",
        body: uploadForm,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to upload image");

      await update({
        user: {
          ...session.user,
          photo: data.photo,  // update photo in session
        },
      });

      setProfileImage(data.photo);  // update the image in the UI

    } catch (error) {
      setProfileImage(session?.user?.photo || "/images/default-profile.jpeg");
      setUpdateError(error.message);
      setTimeout(() => setUpdateError(null), 3000);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to update profile");

      await update({
        user: {
          ...session.user,
          name: formData.name,
          email: formData.email,
          photo: profileImage.includes("blob:") ? session.user.photo : profileImage,
        },
      });

      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      if (formData.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", formData.theme);

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setUpdateError(error.message);
      setTimeout(() => setUpdateError(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };


  console.log("Session data:", session);
  if (status === "loading") return <div>Loading...</div>;
  return (
    <div>
      <Nav />
      <div className="min-h-screen pt-40 px-4 py-10 bg-gradient-to-br from-indigo-900 to-purple-800 dark:from-[#2d3748] dark:to-[#2d3748] flex justify-center items-start">
        <main className="bg-white dark:bg-gray-900 w-full max-w-6xl p-6 sm:p-10 rounded-2xl shadow-2xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
            Settings & Preferences
          </h1>
          <div className="grid md:grid-cols-2 gap-10">
            {/* LEFT PANEL */}
            <div className="space-y-10">
              {/* Profile Image */}
              <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Profile Picture
                </h2>
                <div className="flex flex-col items-center">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover mb-4"
                  />
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                    Upload Photo
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </section>

              {/* Password */}
              <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Change Password
                </h2>
                <div className="space-y-4">
                  {["currentPassword", "newPassword", "confirmPassword"].map((field, i) => (
                    <input
                      key={i}
                      name={field}
                      type="password"
                      placeholder={
                        field === "currentPassword"
                          ? "Current Password"
                          : field === "newPassword"
                          ? "New Password"
                          : "Confirm Password"
                      }
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                    />
                  ))}
                </div>
              </section>

              {/* Preferences */}
              <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Language & Theme
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="bg-gray-200 text-black px-4 py-2 rounded-md"
                  >
                    <option value="English">English</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                  <select
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="bg-gray-200 text-black px-4 py-2 rounded-md"
                  >
                    <option value="normal">Normal Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
              </section>
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-10">
              {/* Basic Info */}
              <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h2>
                <div className="space-y-4">
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

              {/* Privacy */}
              <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Privacy Settings
                </h2>
                <div className="space-y-3 text-gray-900 dark:text-white">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={formData.notifications}
                      onChange={handleChange}
                    />
                    Enable Notifications
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="showPersonalInfo"
                      checked={formData.showPersonalInfo}
                      onChange={handleChange}
                    />
                    Show Personal Info
                  </label>
                </div>
              </section>

              {/* Actions */}
              <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Account Controls
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <button className="w-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
                  <FaTrash /> Delete Account
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="w-full bg-gray-700 hover:bg-gray-600 transition text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Save Button and Status */}
          {/* Save Button and Status */}
<div className="mt-10 flex flex-col items-center space-y-4">
  {updateError && <p className="text-red-500 mb-2">{updateError}</p>}
  {updateSuccess && <p className="text-green-500 mb-2">Profile updated successfully!</p>}

  <button
    onClick={handleSave}
    disabled={isUpdating}
    className={`px-8 py-3 rounded-full font-semibold text-lg transition duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400
      ${
        isUpdating
          ? "bg-gradient-to-r from-green-700 to-green-800 opacity-60 cursor-not-allowed text-white"
          : "bg-gradient-to-r from-green-500 to-green-700 text-white hover:shadow-xl hover:scale-105"
      }`}
  >
    {isUpdating ? "Saving..." : "Save Changes"}
  </button>

  <p className="text-white mt-6 text-lg text-center max-w-xl">
    Interested in sharing your knowledge? Apply to become a teacher and inspire others.
  </p>

  <button
    onClick={() => router.push("/RequestTeacher")}
    className="w-fit text-sm border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition py-2 px-6 rounded-full font-medium flex items-center justify-center gap-2"
  >
    <FaChalkboardTeacher /> Become a Teacher
  </button>
</div>

        </main>
      </div>
    </div>
  );
}
