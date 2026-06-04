"use client";

import ValueCard from "../home-features/value-card";

function StepTimeline({ title, subtitle, steps }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-poppins text-[15px] font-semibold text-[#0A4A4A]">
          {title}
        </h3>
        <p className="font-poppins text-[12px] text-[#6B7280]">{subtitle}</p>
      </div>
      <ol className="relative ml-2 space-y-5 border-l-2 border-[#0a4d46]/15 pl-5">
        {steps.map((step, index) => (
          <li key={`${title}-${index}`} className="relative text-left">
            <span className="absolute -left-[1.65rem] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f6f3] font-nunito text-[11px] font-bold text-[#0a4d46]">
              {step.number}
            </span>
            <div className="flex flex-col gap-2 pt-0.5">
              <img
                src={step.icon}
                alt=""
                className="h-9 w-9 object-contain"
              />
              <h4 className="font-poppins text-[14px] font-semibold text-[#0A4A4A]">
                {step.title}
              </h4>
              <p className="font-nunito text-[13px] leading-relaxed text-[#374151]">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HowItWorksMobile({
  valueCards,
  advisorSteps,
  customerSteps,
}) {
  return (
    <div className="flex w-full flex-col gap-6 lg:hidden">
      <div className="flex flex-col gap-3">
        <p className="font-poppins text-[13px] font-semibold uppercase tracking-wide text-[#F59E0B]">
          Identity, Visibility & Trust
        </p>
        {valueCards.map((card, index) => (
          <ValueCard key={index} {...card} index={index} />
        ))}
      </div>

      <StepTimeline
        title="For Advisors"
        subtitle="4 steps to build credibility"
        steps={advisorSteps}
      />

      <StepTimeline
        title="For Customers"
        subtitle="4 steps to find trusted advisors"
        steps={customerSteps}
      />
    </div>
  );
}
