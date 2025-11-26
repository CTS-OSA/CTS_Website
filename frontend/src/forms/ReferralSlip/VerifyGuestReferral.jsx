import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle } from "react-feather";
import Navbar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useApiRequest } from "../../context/ApiRequestContext";

const VerifyReferralPage = () => {
  const { request } = useApiRequest();
  const [searchParams] = useSearchParams();
  const pendingId = searchParams.get("pending_id");
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying your referral submission...");
  const [icon, setIcon] = useState(<CheckCircle className="check-icon" size={80} />);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    console.log("Pending ID:", pendingId);
    console.log("Token:", token);
    const verifyReferral = async () => {
      try {
        const response = await request("http://localhost:8000/api/forms/guest/verify-referral-submission/", {
          method: "POST",
          skipAuth: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pending_id: pendingId, token: token }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message || "Referral verified successfully!");
          setIcon(<CheckCircle className="check-icon" size={80} />);
        } else {
          const errorMsg = data.error || "Verification failed. The link may be invalid or expired.";
          setMessage(errorMsg);
          console.log(response);
          setIcon(<AlertCircle className="alert-icon" size={80} />);
        }
      } catch (error) {
        console.log(error);
        setMessage("An error occurred during verification.");
        setIcon(<AlertCircle className="alert-icon" size={80} />);
      } finally {
        setLoading(false);
      }
    };

    if (pendingId && token && !calledRef.current) {
      calledRef.current = true;
      verifyReferral();
    }
  }, [pendingId, token]);

  const WaitingModal = () => (
    <div className="modal-overlay">
      <div className="modal-content modal-message-with-spinner">
        <div className="loading-spinner" />
        <p className="loading-text">Waiting for verification...</p>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="verified-page">
        <div className="content-container">
          {loading ? (
            <WaitingModal />
          ) : (
            <>
              {icon}
              <h2>{message}</h2>
              {message.toLowerCase().includes("verified") && (
                <button
                  onClick={() => navigate("/submitted-forms/counseling-referral-slip")}
                  className="continue-button"
                >
                  Continue
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyReferralPage;
