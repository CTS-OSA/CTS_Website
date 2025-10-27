import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ServicesCarousel({ initialIndex = 1 }) {
  const items = [
    {
      title: "Psychological Testing",
      subtitle: "Discover Your Strengths And Potential",
      description:
        "Through standardized tests, we help you assess your strengths and weaknesses in areas like personality, aptitude, interests, and motivation. These tests, including assessments of mental ability, personality, interests, and leadership style, can provide valuable insights for personal development.",
    },
    {
      title: "Counseling",
      subtitle: "Your Space To Explore And Grow",
      description:
        "We offer a safe and supportive space for you to explore your thoughts and feelings, and to discover the choices available to you. Our CTS personnel are here to provide care and support as you navigate the challenges and opportunities of growing up.",
    },
    {
      title: "Career Education / Transition Program",
      subtitle: "Launch Your Future",
      description:
        "We empower you to make successful transitions to further education, training, and future employment. Take advantage of our job fairs, career placement orientations, pre-employment seminars, and company presentations to kickstart your career.",
    },
    {
      title: "Psycho-Social Session",
      subtitle: "Connect and Adjust",
      description:
        "As a first-year student, you'll participate in a small group session called \"First Bloc Encounter\" shortly after the General Freshies Orientation Program. This session is designed to help you build relationships, adjust to academic life, understand your professors' teaching styles, and embrace the university culture.",
    },
    {
      title: "Information Service",
      subtitle: "Your Guide to Success",
      description:
        "We provide you with the information you need to thrive, covering personal, social, educational, and career development. All first-year students are invited to attend our general orientation program a week before classes begin.",
    },
    {
      title: "Individual Inventory Service",
      subtitle: "Know Yourself Better",
      description:
        "We continuously gather data about you to help you understand yourself better and to respond effectively to your needs. This ongoing process provides a foundation for personalized support and guidance.",
    },
    {
      title: "Individual In-take Interview",
      subtitle: "Your Personal Check-In",
      description:
        "As a first-year student, particularly those who are STAR (Student at Risk) or SWAN (Student with a Need), you'll have an individual intake interview with the Counseling and Testing Section (CTS) during the second semester. This is an opportunity for us to follow up on your Mental Health assessment result, progress, gather in-depth information, interpret your test results, and discuss potential counseling options.",
    },
    {
      title: "Readmission Evaluation",
      subtitle: "Supporting Your Return",
      description:
        "If you're seeking readmission to the university, we offer interviews and psychological testing to support your application. The results will be shared with the relevant colleges for their consideration, and we'll schedule follow-up counseling within the semester to help you succeed.",
    },
    {
      title: "Exit Interview",
      subtitle: "Your Voice Matters",
      description:
        "We continuously gather data about you to help you understand yourself better and to respond effectively to your needs. This ongoing process provides a foundation for personalized support and guidance.",
    },
    {
      title: "Referral",
      subtitle: "Connecting You to the Right Resources",
      description:
        "We offer two types of referrals: (i) referring students to external professionals like psychologists or psychiatrists outside the university, and (ii) receiving referrals from other members of the university community who believe a student could benefit from our services.",
    },
  ];

  const [index, setIndex] = useState(initialIndex);
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const rAF = useRef(null);

  const TRANSITION = "transform 380ms cubic-bezier(0.22, 0.85, 0.26, 1)";

  const recenter = (animate = true) => {
    const active = cardRefs.current[index];
    const track = trackRef.current;
    const container = containerRef.current;
    if (!active || !track || !container) return;

    const containerWidth = container.clientWidth;
    const trackWidth = track.scrollWidth;
    const activeCenter = active.offsetLeft + active.offsetWidth / 2;

    const desired = containerWidth / 2 - activeCenter;
    const minTranslate = Math.min(containerWidth - trackWidth, 0);
    const maxTranslate = 0;
    const translateX = Math.max(Math.min(desired, maxTranslate), minTranslate);

    if (!animate) {
      track.style.transition = "none";
    } else {
      track.style.transition = TRANSITION;
    }

    track.style.transform = `translate3d(${translateX}px, 0, 0)`;
  };

  useEffect(() => {
    if (rAF.current) cancelAnimationFrame(rAF.current);
    rAF.current = requestAnimationFrame(() => recenter(true));

    const handleResize = () => {
      if (trackRef.current) trackRef.current.style.transition = "none";
      if (rAF.current) cancelAnimationFrame(rAF.current);
      rAF.current = requestAnimationFrame(() => recenter(false));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (rAF.current) cancelAnimationFrame(rAF.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [index, items.length]);

  const goTo = (i) => {
    const newIndex = Math.max(0, Math.min(i, items.length - 1));
    setIndex(newIndex);
  };

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <h3 className="text-center text-2xl font-bold text-white mb-8 sm:mb-12 font-condensed">
          Programs and Services
        </h3>

        <div className="relative w-full h-96 sm:h-[420px]">
          {/* Arrows only visible on screens >= sm */}
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="hidden sm:flex absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 bg-upmaroon hover:bg-red-700 text-white rounded-full p-2 border shadow disabled:opacity-40 z-30 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft size={21} />
          </button>

          <button
            onClick={() => goTo(index + 1)}
            disabled={index === items.length - 1}
            className="hidden sm:flex absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 text-white bg-upmaroon hover:bg-red-700 rounded-full p-2 border shadow disabled:opacity-40 z-30 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Carousel */}
          <div ref={containerRef} className="relative overflow-hidden ">
            <div
              ref={trackRef}
              className="flex items-center gap-4 will-change-transform"
              style={{ transform: "translate3d(0,0,0)" }}
            >
              {items.map((it, i) => {
                const isActive = i === index;

                return (
                  <div
                    key={i}
                    ref={(el) => (cardRefs.current[i] = el)}
                    onClick={() => goTo(i)}
                    className={`bg-white rounded-2xl shadow-lg cursor-pointer shrink-0 transition-all duration-700 ${
                      isActive
                        ? "w-72 sm:w-96 h-80 sm:h-96 z-20"
                        : "w-72 sm:w-96 h-80 sm:h-96 z-10 opacity-50"
                    }`}
                  >
                    <div className="flex flex-col h-full p-4 sm:p-6">
                      <h4
                        className={`font-bold transition-all duration-300 font-roboto ${
                          isActive
                            ? "text-2xl sm:text-3xl"
                            : "text-lg sm:text-xl"
                        } mb-1`}
                      >
                        {it.title}
                      </h4>

                      {it.subtitle && (
                        <p className="text-xs sm:text-sm italic font-roboto text-gray-600 mb-2">
                          {it.subtitle}
                        </p>
                      )}

                      {isActive && (
                        <p className="text-[12px] font-condensed sm:text-[16px]  ">
                          {it.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile-only dots */}
          <div className="sm:hidden flex items-center justify-center gap-2 mt-10">
            {items.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-transform ${
                  i === index ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
