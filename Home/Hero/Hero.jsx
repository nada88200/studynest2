import React from "react";
import { HeroContent } from "./HeroContent";
import { HeroImage } from "./HeroImage";

export const Hero = () => {
    return (
       <div className="w-full pt-[4vh] md:pt-[12vh] h-screen bg-gradient-to-br from-indigo-900 to-purple-800 dark:from-[#2d3748] dark:to-[#2d3748]  overflow-hidden">
       <div className="flex justify-center flex-col w-4/5 h-full mx-auto ">
       <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        <HeroContent />
        <HeroImage />
       </div>
       </div>
       </div>
    );
    }