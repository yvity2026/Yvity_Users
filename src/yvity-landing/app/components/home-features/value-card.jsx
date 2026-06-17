"use client";

import { motion } from "framer-motion";

export default function ValueCard({ title, description, icon, titleColor, index }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay: index * 0.1 },
        },
      }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-[#F8F6F1] rounded-2xl p-8 md:p-5 lg:p-7 xl:p-8 text-center flex flex-col items-center hover:shadow-[0_4px_4px_0_rgba(2,131,130,0.25)] hover:border-[#065F46] hover:border"
    >
      <div className="w-14 h-14 bg-[#0A4A4A] rounded-xl flex items-center justify-center mb-6">
        <img src={icon} alt={title} />
      </div>

      <h3 className={`text-xl mb-4 font-bold font-cormorant ${titleColor}`}>
        {title}
      </h3>

      <p className="text-[#374151] text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] font-poppins text-xs leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}