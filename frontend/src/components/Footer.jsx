import React from "react";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  const navLinks = [
    { name: "UP System", url: "https://up.edu.ph" },
    { name: "UP Diliman", url: "https://upd.edu.ph" },
    { name: "UP Los Baños", url: "https://uplb.edu.ph" },
    { name: "UP Manila", url: "https://upm.edu.ph" },
    { name: "UP Visayas", url: "https://upv.edu.ph" },
    { name: "UP Open University", url: "https://upou.edu.ph" },
    { name: "UP Baguio", url: "https://upb.edu.ph" },
    { name: "UP Cebu", url: "https://upcebu.edu.ph" },
  ];

  const studentLinks = [
    { name: "Academic Programs", url: "#" },
    { name: "CSRS for Students", url: "#" },
    { name: "Student Policies", url: "#" },
    { name: "Scholarships", url: "#" },
    { name: "Downloadable Forms", url: "#" },
  ];

  const staffLinks = [
    { name: "CSRS for Faculty", url: "#" },
    { name: "Citizen's Charter", url: "#" },
    { name: "University Policies", url: "#" },
    { name: "Downloadable Forms", url: "#" },
  ];

  return (
    <footer className="w-full bg-upmaroon text-white font-roboto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* FIRST COLUMN */}
          <div>
            <p className="md:text-lg text-sm font-bold">
              University of the Philippines - Mindanao
            </p>
            <p className="text-sm mt-1">Office of the Student Affairs</p>
            <p className="text-sm mt-1">Counseling and Testing Section</p>
            <p className="text-sm mt-1">
              UP Mindanao, Mintal, Tugbok District,
            </p>
            <p className="text-sm mt-1">Davao City, Philippines, 8000</p>

            {/* CONTACT INFO */}
            <div className="mt-4 flex flex-col sm:flex-row justify-center md:justify-start items-center sm:items-center gap-4 text-sm text-white/90">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Phone className="w-4 h-4 shrink-0" />
                <span>09xx xxx xxxx</span>
              </div>

              <div className="flex items-center gap-2 whitespace-nowrap">
                <Mail className="w-4 h-4 shrink-0" />
                <span>osa.cts@upmin.edu.ph</span>
              </div>
            </div>
          </div>

          {/* SECOND COLUMN */}
          <div className="flex flex-col items-center md:items-center text-center">
            <h4 className="uppercase text-sm font-semibold mb-3 tracking-wide">
              FOR CURRENT STUDENTS
            </h4>
            <ul className="space-y-2 text-sm text-white/90">
              {studentLinks.map((link) => (
                <li
                  key={link.name}
                  className="transition duration-150 ease-in-out transform hover:scale-105 hover:text-upyellow"
                >
                  <a
                    href={link.url}
                    className="transition duration-150 ease-in-out transform hover:scale-105 hover:text-upyellow"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* THIRD COLUMN */}
          <div className="flex flex-col items-center md:items-center text-center">
            <h4 className="uppercase text-sm font-semibold mb-3 tracking-wide">
              FOR TEACHING AND NONTEACHING STAFF
            </h4>
            <ul className="space-y-2 text-sm text-white/90">
              {staffLinks.map((link) => (
                <li
                  key={link.name}
                  className="transition duration-150 ease-in-out transform hover:scale-105 hover:text-upyellow"
                >
                  <a
                    href={link.url}
                    className="transition duration-150 ease-in-out transform hover:scale-105 hover:text-upyellow"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="h-[4px] bg-upyellow" />
        <div className="bg-upgreen">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 py-3 overflow-x-auto whitespace-nowrap">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm transition duration-150 ease-in-out transform hover:scale-105 hover:text-upyellow px-4"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-t border-white/10 text-center">
        <p className="text-xs text-white/90">
          &copy; 2025 University of the Philippines Mindanao. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
