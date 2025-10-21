import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./css_pages/HomePage.css";

export const HomePage = () => {
  return (
    <div className="home-container">
      <NavBar />
      <div className="hero-section">
        <h1 className="hero-title">
          Welcome to the{" "}
          <span className="highlighted-text">Office of Student Affairs</span>{" "}
          Digital Platform
        </h1>
        <h2 className="hero-subtitle">Counseling and Testing Section</h2>
        <button className="hero-button">Know More</button>
      </div>
      <div className="homeBackground"></div>
      <Footer />
    </div>
  );
};

export default HomePage;
