import React, { useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import heroImg from "../assets/upmin-hero-image.jpg";
import blob3 from "../assets/Blob 3.png";
import blob9 from "../assets/Blob 9.png";
import vision from "../assets/vision-image.png";
import objectives from "../assets/objectives-image.png";
import PosterCarousel from "../components/PosterCarousel.jsx";
import ServicesCarousel from "../components/ServicesCarousel.jsx";
import ProfessionalsSection from "../components/ProfessionalsSection.jsx";
import "./css_pages/HomePage.css";

export const HomePage = () => {
  const scrollToServices = (e) => {
    e.preventDefault();
    const el = document.getElementById("services");
    if (!el) return;

    const nav = document.querySelector("nav");
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;

    const top =
      el.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-fade--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    const targets = document.querySelectorAll(".scroll-fade");
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
              <p className="text-white/90 text-sm sm:text-base mb-2 font-semibold font-condensed xl:text-2xl text-shadow-lg/30 fade-slide-up">
                OSA - Counseling and Testing Section
              </p>

              <h1 className="text-white font-spartan font-bold leading-tight fade-slide-up delay-1">
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

              <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start justify-center sm:justify-start font-roboto fade-slide-up delay-2">
                <a
                  href="/public-forms"
                  className="
                    w-auto px-4 py-2 text-sm sm:px-5 sm:py-3 sm:text-base
                    rounded-md bg-upmaroon text-white font-semibold
                    shadow-md hover:bg-red-800 transform hover:scale-102
                    transition 
                  "
                >
                  OSA-CTS Forms
                </a>

                <a
                  href="#services"
                  onClick={scrollToServices}
                  className="w-auto px-6 py-2 text-sm sm:px-5 sm:py-3 sm:text-base
             rounded-md bg-white text-gray-800 font-semibold
             border border-white/70 shadow-sm hover:bg-gray-100
             transition transform hover:scale-102"
                >
                  Know More
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-linear-to-t from-black/60 to-transparent" />
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white text-gray-900">
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 place-content-stretch gap-10 sm:gap-20 items-center">
            <div className="relative w-fit place-self-center scroll-fade">
              <img
                src={blob3}
                alt="Red Blob"
                className="w-[70%] h-auto left-0 right-0 mx-auto floating-blob-slow"
              />
              <img
                src={vision}
                alt="Vision"
                className="absolute w-full  top-1/2 left-1/2 
        -translate-x-1/2 -translate-y-1/2"
              />
            </div>

            <div className="place-self-center fade-slide-up delay-1">
              <h2 className="text-xl font-semibold md:text-4xl sm:font-bold text-gray-900 font-condensed leading-tight text-center md:text-left">
                We empower students to cultivate their potential, fostering
                personal growth and development that benefits both themselves
                and the wider community.
              </h2>
            </div>

            {/* Objectives */}
            <div className="place-self-center fade-slide-up">
              <h3 className="font-condensed font-semibold text-xl md:text-4xl mb-3  md:text-right text-center">
                Our Objectives
              </h3>

              <ul className="font-condensed text-md md:text-xl space-y-4 md:text-right text-center list-inside">
                <li className="block">
                  Helping students clarify their issues, understand their
                  feelings and thoughts, and effectively manage challenges.
                </li>
                <li className="block">
                  Providing students with objective assessments of their
                  abilities, potential, strengths, and personality traits to
                  support personal development and life adjustment.
                </li>
                <li className="block">
                  Assisting students in developing decision-making skills and
                  becoming self-reliant individuals.
                </li>
                <li className="block">
                  Enhancing personal effectiveness is essential for maintaining
                  good mental health and achieving positive behavioral changes.
                </li>
                <li className="block">
                  Offering professional support to help students successfully
                  adjust to university life.
                </li>
              </ul>
            </div>

            <div className="relative w-fit place-self-center scroll-fade">
              <img
                src={blob9}
                alt="Green Blob"
                className="w-[60%] sm:w-[70%] h-auto left-0 right-0 mx-auto floating-blob-slow delay-1"
              />
              <img
                src={objectives}
                alt="Objectives"
                className="absolute w-[60%] sm:w-[80%] top-1/2 left-1/2 
        -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
        </section>

        {/* Poster Section */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-1  items-center text-center fade-slide-up">
            <div className="w-full">
              <div className="text-lg sm:text-3xl font-semibold mb-4 font-condensed">
                <p>Wall of Wisdom</p>
                <p className="text-base sm:text-lg font-normal text-gray-700 font-condensed mt-2">
                  Discover inspiring and informative posters from the CTS-OSA
                  that promote student well-being, growth, and positivity.
                </p>
              </div>
            </div>

            <div className="w-full flex justify-center ">
              <div className="w-full max-w-4xl">
                <PosterCarousel />
              </div>
            </div>
          </div>
        </section>

        {/* Programs & Services */}
        <section className="bg-upmaroon/95 fade-slide-up delay-1" id="services">
          <ServicesCarousel />
        </section>

        {/* Professionals */}
        <section className="max-w-7xl mx-auto px-8 sm:px-8 py-12 fade-slide-up">
          <ProfessionalsSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
