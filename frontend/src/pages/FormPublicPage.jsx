import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import ToastMessage from "../components/ToastMessage";
import ModalMessage from "../components/ModalMessage";
import DefaultLayout from "../components/DefaultLayout";
import "./css_pages/FormPublicPage.css";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import LoginModal from "../components/LoginModal";
import { useApiRequest } from "../context/ApiRequestContext";


export const FormPublicPage = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);
  const { user, profileData, loading } = useContext(AuthContext);
  const [cardsPerRow, setCardsPerRow] = useState(4);
  const [hasSubmittedPard, setHasSubmittedPard] = useState(false);
  const { request } = useApiRequest();


  // Number of cards per screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setCardsPerRow(1);
      else if (width < 1024) setCardsPerRow(2);
      else if (width < 1330) setCardsPerRow(3);
      else setCardsPerRow(4);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    if (user) {
      checkPardSubmission().then((hasSubmitted) => {
        if (hasSubmitted) {
          setHasSubmittedPard(true);
        }
      });
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCardClasses = (index) => {
    const isFirstInRow = index % cardsPerRow === 0;
    const isLastInRow = (index + 1) % cardsPerRow === 0;

    let classes = "form-card";
    if (isFirstInRow) classes += " rounded-bl-[50px]";
    if (isLastInRow) classes += " rounded-tr-[50px]";
    return classes;
  };

  const handleCardClick = (form) => {
    if (form === "counseling-referral-slip") {
      navigate(`/forms/${form}`);
      return;
    }

    if (!user) {
      setModalConfig({
        title: "Access Restricted",
        message: "You need to log in to access this form.",
        buttons: [
          {
            label: "Log In",
            onClick: () => {
              setShowModal(false);
              setShowLoginModal(true);
            },
            className: "login-btn",
          },
        ],
        footer: (
          <p className="signup-text">
            Don't have an account yet?{" "}
            <span
              className="signup-link"
              onClick={() => {
                setShowModal(false);
                navigate("/signup");
              }}
            >
              Sign Up
            </span>
            .
          </p>
        ),
      });
      setShowModal(true);
      return;
    }

    if (!loading && (!profileData || !profileData.is_complete)) {
      setModalConfig({
        title: "Complete Your Profile",
        message:
          "Before accessing this form, please complete your student profile.",
        buttons: [
          {
            label: "Set Up Profile",
            onClick: () => {
              setShowModal(false);
              setPageLoading(true);
              setTimeout(() => {
                navigate("/setup-profile");
              }, 500);
            },
            className: "login-btn",
          },
        ],
      });
      setShowModal(true);
      return;
    }

    navigate(`/forms/${form}`);
  };

  const checkPardSubmission = async () => {
      const response = await request(
        `http://localhost:8000/api/forms/psychosocial-assistance-and-referral-desk/check-submission/`,
        {
          method: "HEAD",
          headers: { "Content-Type": "application/json" }
        }
      );
      console.log("response", response);

      if (response?.status === 404) return null;
      // if (response?.status === 200) console.log("has submitted pard");
      return response?.ok;
    };

  const createNewPardSubmission = async () => {
    const response = await request(
      `http://localhost:8000/api/forms/psychosocial-assistance-and-referral-desk/create-new/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }
    );
    
    if (response?.ok) {
      navigate(`/forms/pard`);
    } else {
      setToastMessage("Failed to create new submission");
    }
  };

  const formCards = [
    {
      title: "Basic Information Sheet",
      desc: "Brief details for student registration.",
      id: "basic-information-sheet",
      bg: "white",
    },
    {
      title: "Student Cumulative Information Sheet",
      desc: "Collects cumulative academic and personal data.",
      id: "student-cumulative-information-file",
      bg: "white",
    },
    {
      title: "Counseling Referral Slip",
      desc: "Refers a student for counseling services to address personal, academic, or behavioral concerns",
      id: "counseling-referral-slip",
      bg: "maroon",
    },
    {
      title: "Psychosocial Assistance and Referral Desk",
      desc: "Access psychosocial support and referral services.",
      id: "pard",
      bg: "white",
    },
  ];

  const formContent = (
    <div className="form-page form-fade">
      <div
        className="rounded-2xl bg-[#f9f9f9] min-h-screen flex flex-col"
        style={{ paddingTop: user ? "20px" : "2rem" }}
      >
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-15 py-4 sm:py-8 flex flex-col justify-start">
          <div className="text-center sm:text-left mb-5 sm:mb-8">
            <div
              className="h-2 w-30 md:h-3 md:w-40 lg:w-50 lg:h-5 bg-upmaroon rounded-3xl mb-2 mx-auto sm:mx-0"
              style={{ display: user ? "none" : "block" }}
            ></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-upmaroon">
                FORMS
              </h1>
              <p className="m-0 text-[#333] text-xs sm:text-base max-w-full sm:max-w-[400px] sm:text-right">
                {user
                  ? "Welcome back! Browse and access the available student forms below. Make sure your profile is complete to unlock all features."
                  : "These forms help collect important student information, including personal details and academic records. Please log in to access them."}
              </p>
            </div>
          </div>

          <div className="grid w-full box-border gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {formCards.map((form, index) => (
              <div
                key={form.id}
                className={getCardClasses(index)}
                onClick={() => handleCardClick(form.id)}
                style={{ animationDelay: `${0.2 + index * 0.2}s` }}
              >
                <div className="circle" />
                <div className="flex flex-col h-full gap-2 transition-all duration-300 ease-in-out">
                  <div className="flex flex-col h-3/4 justify-center">
                    <h3 className="form-card-title text-sm sm:text-base md:text-lg">
                      {form.title}
                    </h3>
                    <div className="leading-6 sm:leading-8">
                      <p className="card-desc text-xs sm:text-sm">
                        {form.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button
                      disabled={form.comingSoon}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index === 3 && hasSubmittedPard) {
                          createNewPardSubmission();
                        }
                      }}
                      className={`self-start px-3 sm:px-5 py-1.5 sm:py-[0.6rem] rounded-lg text-xs sm:text-[0.9rem] border transition-colors duration-300 ease-in-out 
                        ${
                          form.comingSoon
                            ? "bg-gray-400 text-white cursor-not-allowed border-transparent"
                            : "bg-upgreen text-white hover:bg-green-700 hover:scale-105 duration-300 ease-in-out cursor-pointer border-transparent active:bg-white active:text-maroon-700 active:border-maroon-700"
                        }`}
                    >
                      {index == 3 ?
                        (hasSubmittedPard ? "Create a new submission" : "Fill Out") :
                        (form.comingSoon ? "Coming Soon" : "Fill Out")
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toastMessage && (
        <ToastMessage
          message={toastMessage}
          onClose={() => setToastMessage("")}
        />
      )}

      {showModal && (
        <ModalMessage
          title={modalConfig.title}
          message={modalConfig.message}
          onClose={() => setShowModal(false)}
          buttons={modalConfig.buttons}
          footer={modalConfig.footer}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            navigate("/signup");
          }}
        />
      )}
    </div>
  );

  if (pageLoading) {
    return <Loader />;
  }

  return user ? (
    <DefaultLayout>{formContent}</DefaultLayout>
  ) : (
    <>
      <Navbar />
      {formContent}
      <Footer />
    </>
  );
};
