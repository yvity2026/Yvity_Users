/**
 * Landing section titles — matches Hero:
 * eyebrow #F59E0B · headline #0A4A4A · accent phrases #F59E0B
 */
export default function LandingSectionHeader({
  eyebrow,
  title,
  accent,
  description,
  className = "",
  dark = false,
}) {
  const align = "items-start text-left";

  const titleColor = dark ? "text-[#F8F6F1]" : "text-[#0A4A4A]";
  const descColor = dark ? "text-[#C0C0C0]" : "text-[#374151]";

  return (
    <div className={`flex flex-col gap-3 md:gap-4 ${align} ${className}`}>
      {eyebrow ? (
        <p className="font-poppins text-sm font-semibold uppercase tracking-[1.4px] text-[#F59E0B]">
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={`font-cormorant text-[28px] font-bold leading-[1.12] sm:text-[36px] lg:text-[48px] ${titleColor}`}
      >
        {accent ? <span className="text-[#F59E0B]">{accent} </span> : null}
        {title}
      </h2>

      {description ? (
        <p
          className={`max-w-2xl font-poppins text-[13px] leading-6 sm:text-[14px] md:text-base md:leading-relaxed ${descColor}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
