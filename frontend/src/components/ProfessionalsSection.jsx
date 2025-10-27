import SirRem from "../assets/SirRem.jpg";
import NurseFely from "../assets/NurseFely.png";
import SirNoggie from "../assets/SirNoggie.png";
import SirPontini from "../assets/SirPontini.png";

export default function ProfessionalsSection() {
  const professionals = [
    {
      name: "Remegio P. Domingo, Jr., DIR, MIR, RGC, RPm",
      role: "Guidance Services Specialist / Psychometrician",
      details: "GC Lic. No.: 0000830 (02-19-2026)",
      detail2: "Psychom. Lic. No.: 0009021 (02-19-2026)",
      image: SirRem,
    },
    {
      name: "Fely S. Pulido, RN",
      role: "Nurse – I",
      details: "Lic. No.: 0303188 (09-20-2025)",
      image: NurseFely,
    },
    {
      name: "Invictus E. Lorenzo, RN",
      role: "Nurse – I",
      details: "Reg. No.: 0645521 (06-12-2027)",
      image: SirNoggie,
    },
    {
      name: "Pontini A. Coloscos, RPm, MSPsy",
      role: "Senior Psychosocial Counselor",
      details: "Reg. No.: 0012840 (09-22-2028",
      image: SirPontini,
    },
  ];

  return (
    <section className="w-full ">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-center text-2xl font-bold text-gray-900 mb-12 font-condensed">
          Professionals under CTS and HSS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {professionals.map((prof, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Top Section with Maroon Background and Circle Image */}
              <div className="relative bg-gradient-to-r from-red-900 to-red-800 h-30 flex items-center justify-center">
                {/* Circular Image Container */}
                <div className="absolute -bottom-16 w-40 h-40 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md flex items-center justify-center">
                  <img
                    src={prof.image}
                    alt={prof.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23d1d5db' width='400' height='400'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%239ca3af'/%3E%3Cpath d='M 80 400 Q 200 300 320 400' fill='%239ca3af'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>

              {/* Bottom Section with Text Content */}
              <div className="pt-20 pb-6 px-6 text-center font-roboto">
                <h4 className="text-sm font-bold text-gray-900 mb-2">
                  {prof.name}
                </h4>
                <p className="text-xs text-gray-700 font-semibold mb-3">
                  {prof.role}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {prof.details}
                  <br />
                  {prof.detail2}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
