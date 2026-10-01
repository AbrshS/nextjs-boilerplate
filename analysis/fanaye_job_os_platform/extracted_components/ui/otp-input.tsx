"use client";

import * as React from "react";
import { cn } from "@/shared/utils/cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  length?: number;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  className,
  length = 6,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const digits = React.useMemo(() => {
    const arr = value.replace(/\D/g, "").split("").slice(0, length);
    while (arr.length < length) {
      arr.push("");
    }
    return arr;
  }, [value, length]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const inputVal = e.target.value;
    const cleanDigits = inputVal.replace(/\D/g, "");

    if (!cleanDigits) {
      const newDigits = [...digits];
      newDigits[index] = "";
      const newValue = newDigits.join("");
      onChange(newValue);
      return;
    }

    if (cleanDigits.length > 1) {
      const combined = cleanDigits.slice(0, length);
      onChange(combined);
      if (combined.length === length) {
        onComplete?.(combined);
        focusInput(length - 1);
      } else {
        focusInput(combined.length);
      }
      return;
    }

    // Single digit entered
    const singleDigit = cleanDigits.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    const newValue = newDigits.join("");
    onChange(newValue);

    if (index < length - 1) {
      focusInput(index + 1);
    }

    if (newValue.length === length) {
      onComplete?.(newValue);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        const newValue = newDigits.join("");
        onChange(newValue);
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const cleanDigits = pastedData.replace(/\D/g, "").slice(0, length);
    if (cleanDigits) {
      onChange(cleanDigits);
      if (cleanDigits.length === length) {
        onComplete?.(cleanDigits);
        focusInput(length - 1);
      } else {
        focusInput(cleanDigits.length);
      }
    }
  };

  return (
    <div className={cn("flex items-center justify-between gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          value={digits[i] || ""}
          disabled={disabled}
          aria-label={`Verification code digit ${i + 1}`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          onChange={(e) => handleInputChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-13 sm:w-12 sm:h-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[20px] font-bold text-center font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus-visible:border-orange-500 focus-visible:ring-3 focus-visible:ring-orange-500/20 transition-all"
        />
      ))}
    </div>
  );
}
