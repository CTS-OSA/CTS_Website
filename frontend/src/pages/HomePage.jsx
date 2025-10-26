import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import heroImg from "../assets/upmin-hero-image.jpg";

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />

      <header
        aria-label="Hero section"
        className="
        relative w-full
        h-[55vh] sm:h-auto
        aspect-1442/600
        bg-cover bg-no-repeat
        bg-position-[right_30%]          
        sm:bg-top           
        transition-all duration-300 ease-in-out
      "
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="absolute inset-0" />
        <p className="absolute bottom-2 right-5 text-white text-xs">
          © UP Mindanao Public Relations Office
        </p>
        <div className="relative z-10 flex items-center justify-center sm:justify-start h-full">
          <div className="w-full px-5 sm:px-8 md:px-16 lg:px-24">
            <div className="max-w-lg sm:max-w-2xl text-center sm:text-left">
              <p className="text-white/90 text-sm sm:text-base mb-2 font-semibold font-condensed xl:text-2xl text-shadow-lg/30">
                OSA - Counseling and Testing Section
              </p>

              <h1 className="text-white font-spartan font-bold leading-tight ">
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-shadow-lg/30">
                  Help That{" "}
                  <span
                    className="text-upmaroon inline-block font-black"
                    style={{
                      textShadow: "none",
                    }}
                  >
                    Listens.
                  </span>
                </span>

                <span className="block mt-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-shadow-lg/30">
                  Support That{" "}
                  <span className="text-yellow-400 inline-block font-black">
                    Cares.
                  </span>
                </span>
              </h1>

              <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start justify-center sm:justify-start font-roboto">
                <a
                  href="/referral"
                  className="
                    w-auto px-4 py-2 text-sm sm:px-5 sm:py-3 sm:text-base
                    rounded-md bg-upmaroon text-white font-semibold
                    shadow-md hover:bg-red-800 transform hover:scale-102
                    transition 
                  "
                >
                  Referral Form
                </a>

                <a
                  href="#learn-more"
                  className="
                    w-auto px-6 py-2 text-sm sm:px-5 sm:py-3 sm:text-base
                    rounded-md bg-white text-gray-800 font-semibold
                    border border-white/70 shadow-sm hover:bg-gray-100
                    transition transform hover:scale-102
                  "
                >
                  Know More
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-linear-to-t from-black/60 to-transparent" />
      </header>

      <main className="flex-1"></main>

      <Footer />
    </div>
  );
};

export default HomePage;
