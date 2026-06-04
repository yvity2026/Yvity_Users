"use client";

const CARDS = [
  {
    id: "find",
    title: "Find a Professional",
    description:
      "Looking for expert guidance or services? Search and discover trusted professionals on YVITY.",
    buttonLabel: "Start Searching",
  },
  {
    id: "offer",
    title: "Offer Your Services",
    description:
      "Are you an insurance advisor? Create your professional workspace and become discoverable on YVITY.",
    buttonLabel: "Go To My Space",
  },
];

function GuidanceCard({ title, description, buttonLabel, onClick, variant }) {
  const isFind = variant === "find";

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-[0_2px_14px_rgba(10,74,74,0.06)] sm:rounded-[24px] sm:p-6 ${
        isFind ? "border-[#E4E2DB]" : "border-[#D4E8E6]"
      }`}
    >
      <h2 className="font-cormorant text-xl font-bold leading-tight text-[#0A4A4A] sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 flex-1 font-poppins text-sm leading-relaxed text-[#6B7280] sm:text-[15px]">
        {description}
      </p>
      <button
        type="button"
        onClick={onClick}
        className={`mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-5 py-3 font-poppins text-sm font-semibold transition active:scale-[0.98] ${
          isFind
            ? "bg-[#0A4A4A] text-[#F59E0B] hover:bg-[#083c3c]"
            : "border-2 border-[#0A4A4A] bg-white text-[#0A4A4A] hover:bg-[#F8F6F1]"
        }`}
      >
        {buttonLabel}
      </button>
    </article>
  );
}

export default function DashboardOnboardingGuidance({
  onStartSearching,
  onGoToMySpace,
}) {
  return (
    <section className="mb-6" aria-label="Getting started on YVITY">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <GuidanceCard
          variant="find"
          title={CARDS[0].title}
          description={CARDS[0].description}
          buttonLabel={CARDS[0].buttonLabel}
          onClick={onStartSearching}
        />
        <GuidanceCard
          variant="offer"
          title={CARDS[1].title}
          description={CARDS[1].description}
          buttonLabel={CARDS[1].buttonLabel}
          onClick={onGoToMySpace}
        />
      </div>
    </section>
  );
}
