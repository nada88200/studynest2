"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Nav } from "@/Home/Navbar/Nav";
import Image from "next/image";
import Link from "next/link";
import React,{useState,useEffect} from "react";
import { navLinks } from "@/constant/constant";
import {Hero} from '@/Home/Hero/Hero';
import { HeroContent } from "@/Home/Hero/HeroContent";
import { HeroImage } from "@/Home/Hero/HeroImage";
import { About } from "@/Home/About/About";
import { FaArrowRight,FaAward } from "react-icons/fa";
import { Courses } from "@/Home/Courses/Courses";
import { coursesData } from "@/data/data";
import Tilt from 'react-parallax-tilt';
import { FaStar } from "react-icons/fa";
import { CourseCard } from "@/Home/Courses/CourseCard";
import { Feature } from "@/Home/Feature/Feature";
import { FaBriefcase } from "react-icons/fa";
import {Review} from "@/Home/Review/Review";
import { BsQuote } from "react-icons/bs";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import SliderCard from "@/Helper/SliderCard";
import {Article} from "@/Home/Article/Article";
import {Footer} from "@/Home/Footer/Footer";

export default function HomePage() {
    // const { data: session } = useSession();

    // const [navbg, setNavbg] = useState(false);
    
    //     useEffect(() => {
    //         const handler = () => {
    //             if (window.scrollY >= 90) {
    //                 setNavbg(true);
    //             } else {
    //                 setNavbg(false);
    //             }
    //         };
    
    //         window.addEventListener("scroll", handler);
    
    //         return () => {
    //             window.removeEventListener("scroll", handler);
    //         };
    //     }
    //     , []);

    // const responsive = {
    //     superLargeDesktop: {
    //       // the naming can be any, depends on you.
    //       breakpoint: { max: 4000, min: 3000 },
    //       items: 5
    //     },
    //     desktop: {
    //       breakpoint: { max: 3000, min: 1324 },
    //       items: 1,
    //       slidesToSlide: 1 // optional, default to 1.
    //     },
    //     tablet: {
    //       breakpoint: { max: 1324, min: 764 },
    //       items: 1
    //     },
    //     mobile: {
    //       breakpoint: { max: 764, min: 0 },
    //       items: 1
    //     }
    //   };
    return (

        <div>
       <div><Nav/></div>
       <div><Hero/></div>
       <div><About/></div>
       <div><Courses/></div>
       <div><Feature/></div>
       <div><Review/></div>
       <div><Article/></div>
      
       <script src="https://app.rasheed.ai/static/chatbot/js/chatbubble.js" data-id="cad4a91b-c27a-4969-93bc-9dea1856488e" data-domain="https://app.rasheed.ai" data-position="right" ></script>
      


        </div>


    // <div className={`fixed ${navbg?'bg-indigo-800':'fixed'} w-full h-[12vh] z-[1000] bg-blue-500 transition-all duration-200`}>
    //     <div className="flex items-center justify-between h-full w-[90%] mx-auto xl:w-[80%]">
    //      <Image src="/images/logo.png" alt="Logo" width={120} height={120}/>
    //      <div className="hidden lg:flex items-center space-x-10">
    //     {navLinks.map((link) => {
    //         return(
    //             <Link key={link.id} href={link.url}>
    //                 <p className="nav__link">{link.label}</p>
    //             </Link>
    //         );
    //     })}
    // </div>
    // <div className="flex items-center space-x-4">
    //     <button 
    //         className="px-10 py-2 text-white font-semibold text-base bg-pink-700 hover:bg-pink-900 transition-all duration-200 rounded-lg"
    //         onClick={() => signOut()}
    //        >
    //         Log Out</button>

    //      </div>
    //      </div>
    //      </div> 
    );
    }