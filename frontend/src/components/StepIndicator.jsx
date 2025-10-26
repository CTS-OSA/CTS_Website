import React from "react";

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center flex-row lg:flex-col w-full lg:w-max max-md:flex-row">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep - 1;
        const isCurrent = index === currentStep - 1;
        const isLast = index === steps.length - 1;

        const circleFill = isCompleted
          ? "bg-[#7b1113]"
          : isCurrent
          ? "bg-transparent"
          : "bg-transparent";
        const textColor = "text-white";

        return (
          <div
            key={index}
            className={`flex items-center  lg:flex-col flex-row relative ${
              isLast ? "pr-6 lg:pr-0" : ""
            }`}
          >
            {/* Step Label */}
            <div className="absolute mt-2 lg:top-0 top-full lg:left-full lg:ml-4 lg:w-max transition-all gap-0 duration-500 ease-in-out">
              <p className="text-[10px] font-semibold text-black lg:text-white">
                STEP {index + 1}
              </p>
              <h6
                className={`text-sm font-semibold ${textColor} transition-colors duration-500 hidden lg:block`}
              >
                {step.label}
              </h6>
            </div>

            {/* Circle */}
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 shrink-0 mx-[-1px] border-2 lg:border-white border-[#7b1113] flex items-center justify-center rounded-full ${circleFill} transition-all duration-500 ease-in-out relative`}
            >
              <span
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-[#7b1113] lg:bg-white rounded-full transition-opacity duration-500 absolute ${
                  isCompleted ? "opacity-0" : "opacity-100"
                }`}
              ></span>

              {isCompleted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 fill-white absolute transition-opacity duration-500 ${
                    isCompleted ? "opacity-100" : "opacity-0"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z" />
                </svg>
              ) : (
                <span className="w-3 h-3 lg:bg-white rounded-full transition-all duration-500 ease-in-out transform scale-100"></span>
              )}
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div
                className={`lg:w-0.5 lg:h-16 h-0.5 w-12 sm:w-14 lg:w-0.5 lg:h-16 bg-[#7b1113] lg:bg-white origin-left lg:origin-top transform transition-transform duration-700 ease-in-out ${
                  isCompleted
                    ? "lg:scale-y-100 scale-x-100"
                    : "lg:scale-y-0 scale-x-0"
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
