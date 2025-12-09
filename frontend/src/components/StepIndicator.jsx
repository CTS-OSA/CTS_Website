import React from "react";
import { Check } from "lucide-react";

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="
  flex items-center justify-center lg:pl-0
  flex-row lg:ml-0 pb-4 lg:pb-0 lg:flex-col 
  w-full lg:w-max max-md:flex-row 
  lg:mt-2 -mb-5 lg:mb-0 
  overflow-x-auto lg:overflow-visible
">

      {steps.map((step, index) => {
        const isCompleted = index < currentStep - 1;
        const isCurrent = index === currentStep - 1;
        const isLast = index === steps.length - 1;

        const circleFill = isCompleted
          ? "bg-[#7b1113]"
          : isCurrent
            ? "bg-transparent"
            : "bg-transparent";

        return (
          <div
            key={index}
            className={`flex items-center lg:flex-col flex-row relative ${isLast ? "pr-6 lg:pr-0" : ""
              }`}
          >
            {/* Step Label */}
            <div className="absolute mt-2 lg:-mt-1 lg:top-0 top-full lg:left-full lg:ml-4 lg:w-32 transition-all gap-0 duration-500 ease-in-out hidden lg:block">
              <p className="text-[10px] font-semibold text-black lg:text-white">
                STEP {index + 1}
              </p>
              <h6 className="text-sm font-semibold text-white transition-colors duration-500 whitespace-normal">
                {step.label}
              </h6>
            </div>

            {/* Circle */}
            <div
              className={`
                flex items-center justify-center rounded-full border-2 
                lg:border-white border-upmaroon shrink-0 
                transition-all duration-500 ease-in-out relative
                ${circleFill}

                /* SIZE ADJUSTMENTS */
                w-7 h-7         /* base */
                sm:w-8 sm:h-8   /* small screens */
                md:w-8 md:h-8 /* bigger on medium screens */
                lg:w-8 lg:h-8 /* large screens */
              `}
            >
              {/* Lucide Check for completed */}
              {isCompleted ? (
                <Check
                  className="w-4 h-4 sm:w-5 sm:h-5 
                             text-white absolute transition-opacity duration-500 
                             opacity-100"
                />
              ) : null}

              {/* Step number on small screens */}
              <span
                className={`text-sm font-bold text-upmaroon lg:hidden transition-opacity duration-500 ${isCompleted ? "opacity-0" : "opacity-100"
                  }`}
              >
                {index + 1}
              </span>

              {/* Inner dot for large screens */}
              <span
                className={`
                  rounded-full absolute hidden lg:block
                  transition-opacity duration-500
                  ${isCompleted ? "opacity-0" : "opacity-100"}

                  /* dot sizes */
                  w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4
                  bg-white
                `}
              ></span>
            </div>

            {/* Line */}
            {!isLast && (
              <div
                className={`
                  lg:w-0.5 lg:h-16 h-0.5 w-7 md:w-14 bg-upmaroon lg:bg-white
                  origin-left lg:origin-top transform transition-transform 
                  duration-700 ease-in-out
                  ${isCompleted
                    ? "lg:scale-y-100 scale-x-100"
                    : "lg:scale-y-0 scale-x-0"
                  }
                `}
              ></div>
            )}

            {isLast && <div className="hidden lg:block h-16"></div>}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;