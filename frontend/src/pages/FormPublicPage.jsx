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

export const FormPublicPage = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);
  const { user, profileData, loading } = useContext(AuthContext);

  const handleCardClick = (form) => {
    if (form === "referral") {
      setToastMessage("Counseling Referral Slip is coming soon!");
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
              setPageLoading(true);
              navigate("/login");
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
      desc: "This form will be available soon.",
      id: "referral-slip",
      bg: "maroon",
    },
    {
      title: "Psychosocial Assistance and Referral Desk",
      desc: "This form will be available soon.",
      id: "pard",
      bg: "maroon",
    },
  ];

  const formContent = (
    <div className="form-page form-fade">
      <div className="rounded-2xl bg-[#f9f9f9] min-h-screen flex flex-col" style={{paddingTop: user? "20px" : "2rem"}}>
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-15 py-8 flex flex-col justify-star">
          <div className="text-left mb-5">
            <div className="h-7 w-50 bg-upmaroon rounded-3xl mb-2" style={{display: user? "none" : "block"}}></div>
            {/* Top header */}
            <div className="flex justify-between items-start flex-wrap gap-4 ">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#7B1113]">FORMS</h1>
              <p className="m-0 text-[#333] text-sm sm:text-base max-w-[400px] md:text-right grow self-start">
                {user
                  ? "Welcome back! Browse and access the available student forms below. Make sure your profile is complete to unlock all features."
                  : "These forms help collect important student information, including personal details and academic records. Please log in to access them."}
              </p>
            </div>
          </div>

          <div className="grid w-full box-border gap-8 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            {formCards.map((form, index) => (
              <div
                key={form.id}
                className={`form-card 
                  ${form.comingSoon ? "coming-soon" : ""} ${index === 0 ? "rounded-bl-[50px]" : "" } ${index === 3 ? "rounded-tr-[50px]" : ""}`}
                onClick={() => handleCardClick(form.id)}
                style={{ animationDelay: `${0.2 + index * 0.2}s` }}
              >
                <div className="circle" />
                <div className="flex flex-col h-full gap-2 transition-all duration-300 ease-in-out">
                  <div className="flex flex-col h-3/4 justify-center ">
                    <div className="leading-8">
                      <p className="card-desc">{form.desc}</p>
                    </div>
                    <h3 className="form-card-title">{form.title}</h3>
                  </div>
                  <div className="flex justify-end mt-10">
                    <button
                      disabled={form.comingSoon}
                      className={`self-start px-5 py-[0.6rem] rounded-lg text-[0.9rem] border transition-colors duration-300 ease-in-out 
                        ${
                          form.comingSoon
                            ? "bg-gray-400 text-white cursor-not-allowed border-transparent"
                            : "bg-upgreen text-white cursor-pointer border-transparent active:bg-white active:text-maroon-700 active:border-maroon-700"
                        }`}
                    >
                      {form.comingSoon ? "Coming Soon" : "Fill Out"}
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
