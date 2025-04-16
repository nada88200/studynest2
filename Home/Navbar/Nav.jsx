"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React,{useState,useEffect} from "react";
import { navLinks } from "@/constant/constant";

export const Nav = () => {

    const [navbg, setNavbg] = useState(false);

    useEffect(() => {
        const handler = () => {
            if (window.scrollY >= 90) {
                setNavbg(true);
            } else {
                setNavbg(false);
            }
        };

        window.addEventListener("scroll", handler);

        return () => {
            window.removeEventListener("scroll", handler);
        };
    }
    , []);

    return (
        <div className={`fixed ${navbg?'bg-indigo-800':'fixed'} w-full h-[12vh] z-[1000]  transition-all duration-200`}>
        <div className="flex items-center justify-between h-full w-[90%] mx-auto xl:w-[80%]">
         <Image src="/images/logo.png" alt="Logo" width={120} height={120}/>
         <div className="hidden lg:flex items-center space-x-10">
        {navLinks.map((link) => {
            return(
                <Link key={link.id} href={link.url}>
                    <p className="nav__link">{link.label}</p>
                </Link>
            );
        })}
    </div>
    <div className="flex items-center space-x-4">
        <button 
            className="px-10 py-2 text-white font-semibold text-base bg-pink-700 hover:bg-pink-900 transition-all duration-200 rounded-lg"
            onClick={() => signOut()}
           >
            Log Out</button>

         </div>
         </div>
         </div> 
    );
  };
  