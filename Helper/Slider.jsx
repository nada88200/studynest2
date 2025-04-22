"use client";

import React from "react";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import SliderCard from "./SliderCard";

const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1324 },
      items: 1,
      slidesToSlide: 1 // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1324, min: 764 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 764, min: 0 },
      items: 1
    }
  };

export const Slider = () => {
    return (
        <Carousel additionalTransfrom={0} 
        arrows={true}
        autoPlay={true}
        autoPlaySpeed={5000}
        centerMode={false}
        infinite
        responsive={responsive}
        itemClass="item"
       >
        {/* slider card */}
        <SliderCard
        image="/images/r1.jpg"
        name="Jessica Doe"
        role="Web Developer"
        />
        <SliderCard
        image="/images/r2.jpg"
        name="John Doe"
        role="Next JS Developer"
        />
        <SliderCard
        image="/images/r3.jpg"
        name="Jonas Doe"
        role="React Developer"
        />
        </Carousel>
    );
    }
