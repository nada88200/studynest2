"use client";
import React from "react";
import { FaArrowRight, FaAward } from "react-icons/fa";
import { useRouter } from "next/navigation";

export const About = () => {
    const router = useRouter();
  return (
    <div className="pt-16 pb-16">
              {/* define grid */}
              <div className="w-4/5 mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
              {/* 1st part */}
              <div>
                  <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center flex-col"> 
                          <FaAward className="h-6 w-6 text-white"/>
                      </div>
                      <h1 className="text-xl text-black font-semibold">Guaranteed and Certified</h1>
          
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl mt-8 font-bold md:leading-[3rem] lg:leading-[3.5rem] xl:leading-[3.9rem] text-gray-800">
                      Online learning whenever and wherever</h1>
                      <p className="mt-4 text-gray-600">
                      StudyNest is a modern e-learning platform designed to make education accessible from anywhere,
                       at any time. With interactive courses, a vibrant learning community, and personalized tools, 
                       StudyNest empowers students to reach their academic goals with ease and flexibility.
                      </p>
                      <button onClick={() => router.push("/aboutus")}
                       className="flex items-center space-x-2 px-8 py-3 mt-8 hover:bg-gray-700 transition-all duration-200 rounded-3xl bg-black text-white">
                          <span>learn more</span>
                          <FaArrowRight />
                      </button>
          
              </div>
              {/* 2nd part */}
              <div>
                  <div>
                      <h1 className="text-7xl lg:text-9xl font-bold text-black text-opacity-5">
                       01
                       </h1>
                   <div className="-mt-10">
                       <h1 className="text-xl md:text-2xl text-opacity-70 mb-3 text-black font-bold">Flexible schedule</h1>
                       <p className="w-[90%] lg:w-[70%] text-base text-black text-opacity-60">StudyNest offers a flexible schedule that allows students to learn at their own pace and convenience, making education accessible anytime, anywhere.</p>
                   </div>
   
                  </div>
                  <div className="mt-8 w-full">
                      <h1 className="text-7xl lg:text-9xl font-bold text-black text-opacity-5">
                       02
                       </h1>
                   <div className="-mt-10">
                       <h1 className="text-xl md:text-2xl text-opacity-70 mb-3 text-black font-bold">Pocket Friendly</h1>
                       <p className="w-[90%] lg:w-[70%] text-base text-black text-opacity-60">
                    StudyNest provides affordable learning solutions without compromising quality. With budget-friendly plans and free resources, it ensures everyone can access valuable education regardless of their financial background.
                       </p>
                   </div>
   
                  </div>
              </div>
          
              </div>
             </div>
          
  );
}