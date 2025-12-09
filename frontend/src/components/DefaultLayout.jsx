import React from "react";
import Navbar from "./NavBar";
import Footer from "./Footer";
import SideNav from "./SideNav";
import "./css/DefaultLayout.css";

const DefaultLayout = ({ children, toast, variant = "student" }) => {
  return (
    <>
      <Navbar />

      {toast}

      <div className="default-layout">
        <div className="main-section">
          <aside className="w-auto max-w-[300px] shrink-0 bg-white flex flex-col z-10">
            {/* <SideNav variant={variant} /> */}
          </aside>

          <main className="main-content">{children}</main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default DefaultLayout;
