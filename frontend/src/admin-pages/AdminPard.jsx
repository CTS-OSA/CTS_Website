import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

export const AdminPard = () => {
  return (
    <div>
      <Navbar />
      <div className="justify-center items-center flex mt-10 mb-10">
        <h1>PARD Forms Records Available Soon</h1>
      </div>
      <Footer />
    </div>
  );
};
