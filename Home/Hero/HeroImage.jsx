"use client";
import React from "react";
import Tilt from 'react-parallax-tilt';
import Image from "next/image";

export const HeroImage = () => {
    return (
       <Tilt>
        <div className="hidden lg:block">
            <Image src="/images/hero.png" width={800} height={800} alt="her"/>
        </div>
       </Tilt>
    );
}