"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface BrandItem {
  name: string;
  src: string;
  size: number;
  initialPos: { x: number; y: number };
  floatDelay: number;
}

const BRANDS: BrandItem[] = [
  { name: "RemoteOK", src: "/RemoteOK.png", size: 68, initialPos: { x: 8, y: 44 }, floatDelay: 0 },
  { name: "LinkedIn", src: "/LinkedIn.png", size: 76, initialPos: { x: 84, y: 42 }, floatDelay: 0.4 },
  { name: "Indeed", src: "/Indeed.png", size: 72, initialPos: { x: 22, y: 62 }, floatDelay: 0.8 },
  { name: "Upwork", src: "/Upwork.png", size: 64, initialPos: { x: 65, y: 58 }, floatDelay: 1.2 },
  { name: "Wellfound", src: "/Wellfound.png", size: 68, initialPos: { x: 12, y: 80 }, floatDelay: 1.6 },
  { name: "Google Jobs", src: "/Google Jobs.png", size: 74, initialPos: { x: 78, y: 80 }, floatDelay: 0.2 },
  { name: "Glassdoor", src: "/Glassdoor.png", size: 70, initialPos: { x: 28, y: 22 }, floatDelay: 0.6 },
  { name: "AngelList", src: "/AngelList.png", size: 62, initialPos: { x: 72, y: 20 }, floatDelay: 1.0 },
  { name: "ZipRecruiter", src: "/ziprecruiter.png", size: 66, initialPos: { x: 5, y: 22 }, floatDelay: 1.4 },
  { name: "Himalayas", src: "/Himalayas.png", size: 64, initialPos: { x: 88, y: 22 }, floatDelay: 0.9 },
  { name: "Jobicy", src: "/Jobicy.jpg", size: 60, initialPos: { x: 30, y: 82 }, floatDelay: 1.5 },
  { name: "Monster Job", src: "/Monster Job.png", size: 68, initialPos: { x: 68, y: 84 }, floatDelay: 0.7 },
  { name: "Arbeitnow", src: "/Arbeitnow.png", size: 62, initialPos: { x: 50, y: 15 }, floatDelay: 1.1 },
];

function BrandBubbleItem({
  brand,
  containerRef,
}: {
  brand: BrandItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 120, damping: 14 });
  const springY = useSpring(rawY, { stiffness: 120, damping: 14 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !bubbleRef.current) return;
      const rect = bubbleRef.current.getBoundingClientRect();
      const bubbleCenterX = rect.left + rect.width / 2;
      const bubbleCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - bubbleCenterX;
      const deltaY = e.clientY - bubbleCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      const threshold = 180;

      if (distance < threshold && distance > 0) {
        const force = (1 - distance / threshold) * 45;
        const angle = Math.atan2(deltaY, deltaX);
        rawX.set(-Math.cos(angle) * force);
        rawY.set(-Math.sin(angle) * force);
      } else {
        rawX.set(0);
        rawY.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [containerRef, rawX, rawY]);

  return (
    <motion.div
      ref={bubbleRef}
      drag
      dragConstraints={containerRef}
      dragElastic={0.2}
      whileHover={{ scale: 1.18, zIndex: 40 }}
      whileTap={{ scale: 0.95 }}
      style={{
        left: `${brand.initialPos.x}%`,
        top: `${brand.initialPos.y}%`,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -14, 0, 14, 0],
        x: [0, 10, 0, -10, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay: brand.floatDelay * 0.3 },
        scale: { duration: 0.8, delay: brand.floatDelay * 0.3 },
        y: {
          duration: 4.5 + (brand.size % 3),
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay: brand.floatDelay,
        },
        x: {
          duration: 5.5 + (brand.size % 4),
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay: brand.floatDelay,
        },
      }}
      className="absolute cursor-grab active:cursor-grabbing group select-none"
    >
      <div
        style={{ width: `${brand.size}px`, height: `${brand.size}px` }}
        className="relative flex items-center justify-center rounded-2xl p-1 transition-all duration-300 group-hover:scale-110"
      >
        <div className="relative h-full w-full overflow-hidden rounded-2xl flex items-center justify-center">
          <Image
            src={brand.src}
            alt={brand.name}
            fill
            sizes="90px"
            className="object-contain p-1 transition-transform duration-300 drop-shadow-[0_8px_20px_rgba(0,0,0,0.25)] group-hover:scale-110"
          />
        </div>
        
        <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900/90 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 shadow-lg">
          {brand.name}
        </span>
      </div>
    </motion.div>
  );
}

export default function BrandBubbles() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      <div className="pointer-events-auto relative h-full w-full">
        {BRANDS.map((brand) => (
          <BrandBubbleItem
            key={brand.name}
            brand={brand}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}
