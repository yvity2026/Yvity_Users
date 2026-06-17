import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official MDRT Round Table logo.
 * Used wherever MDRT / COT / TOT status is displayed.
 * Place the logo at public/images/mdrt-logo.png.
 */
export function MdrtIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/images/mdrt-logo.png"
      alt="MDRT"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}
