import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format",
];

export default function PosterCarousel() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden">
      {/* Carousel Container */}
      <div className="relative w-4/5 max-w-lg h-[300px] md:h-[500px] flex items-center justify-center">
        {/* Left Button */}
        <button
          onClick={prevSlide}
          className="absolute -left-6  sm:left-1 z-30  rounded-full w-8 h-8 flex items-center justify-center  text-white border border-maroon-700 bg-upmaroon hover:scale-110  transition"
        >
          <ChevronLeft />
        </button>

        {/* Image Slides */}
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute transition-all duration-700 ease-in-out transform ${
              index === current
                ? "opacity-100 translate-x-0 scale-100 z-20"
                : "opacity-0 scale-95 z-10"
            }`}
          >
            <img
              src={img}
              alt={`Poster ${index}`}
              className="w-[200px] h-[300px] sm:w-[400px] sm:h-[500px] object-cover rounded-lg shadow-lg"
            />
          </div>
        ))}

        {/* Right Button */}
        <button
          onClick={prevSlide}
          className="absolute -right-6 sm:right-1 z-30  rounded-full w-8 h-8 flex items-center justify-center  text-white border border-maroon-700 bg-upmaroon hover:scale-110  transition"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Navigation Dots */}
      <div className="flex mt-6 space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              current === index ? "bg-upyellow" : "bg-red-900 hover:bg-red-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
