import React, { useState, useEffect} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApiRequest } from "../context/ApiRequestContext";

export default function PosterCarousel() {
  const [posters, setPosters] = useState([]);
  const [current, setCurrent] = useState(0);
  const { request } = useApiRequest();
  

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? posters.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === posters.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  useEffect(() => {
      fetchPosters();
    }, []);
  
  // Fetch Posters
  const fetchPosters = async () => {
    try {
      const response = await request("/api/webmaster/poster/", { skipAuth: true });
      if (response.ok) {
        const data = await response.json();
        setPosters(data);
      }
    } catch (error) {
      console.error("Failed to fetch posters (silent error):", error);
    } 
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
        {posters.map((img, index) => (
          <div
            key={index}
            className={`absolute transition-all duration-700 ease-in-out transform ${
              index === current
                ? "opacity-100 translate-x-0 scale-100 z-20"
                : "opacity-0 scale-95 z-10"
            }`}
          >
            <img
              src={img.image_url}
              alt={`Poster ${index}`}
              className="w-[200px] h-[300px] sm:w-[400px] sm:h-[500px] object-cover rounded-lg shadow-lg"
            />
          </div>
        ))}

        {/* Right Button */}
        <button
          onClick={nextSlide}
          className="absolute -right-6 sm:right-1 z-30  rounded-full w-8 h-8 flex items-center justify-center  text-white border border-maroon-700 bg-upmaroon hover:scale-110  transition"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Navigation Dots */}
      <div className="flex mt-6 space-x-3">
        {posters.map((_, index) => (
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
