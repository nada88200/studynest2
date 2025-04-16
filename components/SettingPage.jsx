"use client";
import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "", // Single name field
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: true,
    showPersonalInfo: true,
    language: "English",
    theme: "normal",
  });

  const [profileImage, setProfileImage] = useState("/default-profile.png");

  // Fetch user data when session is available
  useEffect(() => {
    if (session) {
      setFormData({
        name: session.user?.name || "",
        email: session.user?.email || "",
        notifications: true,
        showPersonalInfo: true,
        language: "English", // Update according to user preferences if saved
        theme: "normal", // Update according to user preferences if saved
      });
      setProfileImage(session.user?.profileImage || "/default-profile.png");
    }
  }, [session]);

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
    router.push("/dashboard"); // Redirect after saving
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="settings-page">
      <main className="settings-form-container bg-indigo-950 text-white p-10">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            {/* Profile Picture */}
            <section className="p-6 border rounded-lg bg-gray-100 h-full">
              <h2 className="text-2xl font-semibold mb-4 text-black">Profile Picture</h2>
              <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-gray-700">
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <label className="bg-blue-700 hover:bg-blue-900 px-4 py-2 rounded cursor-pointer text-white">
                Upload Profile Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </section>

            {/* Change Password */}
            <section className="p-6 border rounded-lg bg-gray-100 w-full">
              <h2 className="text-2xl font-semibold mb-4 text-black">Change Password</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  name="currentPassword"
                  type="password"
                  placeholder="Current Password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="settings-input w-full min-w-0 bg-pink-700 text-black px-4 py-2 rounded"
                />
                <input
                  name="newPassword"
                  type="password"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="settings-input w-full min-w-0 bg-pink-700 text-black px-4 py-2 rounded"
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="settings-input w-full min-w-0 bg-pink-700 text-black px-4 py-2 rounded"
                />
              </div>
            </section>

            {/* Preferences */}
            <section className="p-6 border rounded-lg bg-gray-100 h-full">
              <h2 className="text-2xl font-semibold mb-4 text-black">Language & Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="settings-input bg-yellow-700 text-black font-bold"
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                </select>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="settings-input bg-yellow-700 text-black font-bold"
                >
                  <option value="normal">Normal Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Basic Info */}
            <section className="p-6 border rounded-lg bg-gray-100 h-full overflow-hidden">
              <h2 className="text-2xl font-semibold mb-4 text-black">Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="settings-input bg-blue-500 text-black max-w-full"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="settings-input md:col-span-2 bg-blue-500 text-black max-w-full mb-10"
                />
              </div>
            </section>

            {/* Privacy Settings */}
            <section className="p-6 border rounded-lg bg-gray-100 h-full text-left">
              <h2 className="text-2xl font-semibold mb-4 text-black">Privacy Settings</h2>
              <label className="flex items-center text-black mb-2">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleChange}
                  className="bg-blue-500 text-black mr-2"
                />
                Enable Notifications
              </label>
              <label className="flex items-center text-black">
                <input
                  type="checkbox"
                  name="showPersonalInfo"
                  checked={formData.showPersonalInfo}
                  onChange={handleChange}
                  className="bg-blue-500 text-black mr-2"
                />
                Show Personal Information
              </label>
            </section>

            {/* Account Settings */}
            <section className="p-6 border rounded-lg bg-gray-100 h-full">
              <h2 className="text-2xl font-semibold mb-4 text-black">Account Settings</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <button className="bg-red-700 hover:bg-red-900 px-4 py-2 rounded text-black font-bold">
                  Delete Account
                </button>
                <button
                  onClick={() => signOut()}
                  className="bg-gray-600 hover:bg-gray-800 px-4 py-2 rounded text-black font-bold"
                >
                  Sign Out
                </button>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={handleSave}
            className="bg-green-700 hover:bg-green-900 text-black font-bold px-6 py-3 rounded-lg"
          >
            Save Changes
          </button>

          <button
            onClick={() => router.push("/RequestTeacher")}
            className="bg-yellow-600 hover:bg-yellow-800 px-6 py-3 rounded-lg text-black font-bold"
          >
            Become a Teacher
          </button>
        </div>
      </main>
    </div>
  );
}
