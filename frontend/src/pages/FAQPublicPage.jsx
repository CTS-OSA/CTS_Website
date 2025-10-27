import React from "react";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

const FAQItem = ({ number, question, answer }) => (
  <div
    className="flex flex-col bg-white rounded-xl shadow-sm p-5 mb-4 relative transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer"
  >
    <div className="absolute right-0 top-0 h-full w-5 bg-[#7B1113] rounded-r-xl transition-all duration-300 group-hover:w-6"></div>

    <div className="flex items-start gap-4">
      <div className="bg-[#7B1113] text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold">
        {number}
      </div>

      <div>
        <p className="text-base font-semibold text-black">{question}</p>
        <div className="text-sm text-gray-700 mt-1">{answer}</div>
      </div>
    </div>
  </div>
);

export const FAQPublicPage = () => (
  <>
    <Navbar />
    <div className="bg-[#f9f9f9] min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-15 py-12 flex flex-col justify-start">
        <div className="text-left mb-5">
          <div className="h-7 w-50 bg-[#7B1113] rounded-3xl mb-4"></div>

          <div className="form-header-top flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="md:flex-1">
              <h1 className="text-5xl font-bold text-[#7B1113]">
                Frequently Asked Questions
              </h1>
            </div>

            <div className="md:flex-1 md:flex md:justify-end">
              <p className="text-gray-700 text-base leading-relaxed md:w-[90%] text-justify">
                Learn more about the digitalization of the Basic Information
                Sheet (BIS), Student Cumulative Information File (SCIF), and
                Counseling Referral Slip at UP Mindanao.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 w-full box-border">
          <h2 className="text-2xl font-semibold text-black mb-6">
            General Questions
          </h2>

          <FAQItem
            number={1}
            question="What is the purpose of this digital platform?"
            answer="The platform aims to streamline the submission, management, and access to student information and counseling-related records for UP Mindanao students and staff."
          />

          <FAQItem
            number={2}
            question="Which forms are currently available for digital submission?"
            answer={
              <ul className="list-disc pl-5">
                <li>Basic Information Sheet (BIS)</li>
                <li>Student Cumulative Information File (SCIF)</li>
                <li>Counseling Referral Slip (Coming Soon)</li>
              </ul>
            }
          />

          <FAQItem
            number={3}
            question="Who can access this platform?"
            answer="Currently, UP Mindanao students, faculty, and authorized administrative personnel can access the platform using their UP email accounts."
          />

          <h2 className="text-2xl font-semibold text-black mt-8 mb-6">
            Basic Information Sheet (BIS)
          </h2>

          <FAQItem
            number={4}
            question="What is the BIS used for?"
            answer="The BIS is used to collect essential details from students, including personal data, academic information, and emergency contacts."
          />

          <FAQItem
            number={5}
            question="When should I fill out the BIS?"
            answer="Usually at the beginning of the academic year or as requested by the Office of the University Registrar or Student Affairs."
          />

          <FAQItem
            number={6}
            question="Can I update the BIS after submitting it?"
            answer="Yes. Contact the Office of Student Affairs (OSA) for any necessary updates."
          />

          <h2 className="text-2xl font-semibold text-black mt-8 mb-6">
            Student Cumulative Information File (SCIF)
          </h2>

          <FAQItem
            number={7}
            question="What information does the SCIF collect?"
            answer="The SCIF gathers more comprehensive data including socio-demographic details, academic background, health information, financial status, and support needs."
          />

          <FAQItem
            number={8}
            question="Why is the SCIF important?"
            answer="It helps the university tailor support services (academic, counseling, financial aid) to student needs."
          />

          <FAQItem
            number={9}
            question="Is the SCIF submission mandatory?"
            answer="Yes, especially for incoming or transferring students."
          />

          <h2 className="text-2xl font-semibold text-black mt-8 mb-6">
            Counseling Referral Slip
          </h2>

          <FAQItem
            number={10}
            question="Who can fill out the referral slip?"
            answer="Any UP Mindanao faculty, staff, or personnel who believes a student may benefit from counseling."
          />

          <FAQItem
            number={11}
            question="Where is the form submitted?"
            answer="It is sent to: cts_osa.upmindanao@up.edu.ph."
          />

          <FAQItem
            number={12}
            question="Is student consent needed for referral?"
            answer="While emergencies may override this, it's best to inform the student and gain their consent before referral."
          />

          <FAQItem
            number={13}
            question="How will I know if my referral was received?"
            answer="A referral acknowledgment slip will be returned to the referrer with the status of the case."
          />

          <h2 className="text-2xl font-semibold text-black mt-8 mb-6">
            Privacy and Data Security
          </h2>

          <FAQItem
            number={14}
            question="Is my information secure?"
            answer="Yes. All data submitted through the platform is handled according to the university’s data privacy policy and is accessible only to authorized personnel."
          />

          <FAQItem
            number={15}
            question="Who can view my submissions?"
            answer="Only authorized staff such as OSA personnel, guidance counselors, or specific academic offices will have access."
          />

          <h2 className="text-2xl font-semibold text-black mt-8 mb-6">
            Technical Support
          </h2>

          <FAQItem
            number={16}
            question="I encountered an error during form submission. What should I do?"
            answer="Contact the platform support team or OSA at osa.upmindanao@up.edu.ph."
          />

          <FAQItem
            number={17}
            question="Can I use a mobile device to submit forms?"
            answer="Yes, but for best results, use a desktop or laptop with a stable internet connection."
          />
        </div>
      </div>
    </div>
    <Footer />
  </>
);
