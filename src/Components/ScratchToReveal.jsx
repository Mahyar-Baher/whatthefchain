import React, { useRef, useState, useEffect, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";

export const ScratchToReveal = ({
  width,
  height,
  children,
  minScratchPercentage = 50,
  onComplete,
  gradientColors = ["#A97CF8", "#7000E0", "#000"],
  disabled = false,
}) => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // رسم گرادیانت اولیه
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); // بهینه‌سازی برای getImageData
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(0.5, gradientColors[1]);
    gradient.addColorStop(1, gradientColors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [gradientColors]);

  // تابع اسکرچ کردن
  const scratch = useCallback(
    (clientX, clientY) => {
      if (disabled || isComplete) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2); // کاهش شعاع قلم برای عملکرد بهتر
      ctx.fill();
    },
    [disabled, isComplete]
  );

  // بررسی درصد اسکرچ‌شده
  const checkCompletion = useCallback(() => {
    if (isComplete || disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const totalPixels = pixels.length / 4;
    let clearPixels = 0;

    // نمونه‌برداری تصادفی برای کاهش بار محاسباتی
    const sampleSize = Math.min(totalPixels, 1000); // محدود کردن به 1000 پیکسل
    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor(Math.random() * totalPixels) * 4;
      if (pixels[idx + 3] === 0) clearPixels++;
    }

    const percentage = (clearPixels / sampleSize) * 100;
    if (percentage >= minScratchPercentage) {
      setIsComplete(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onComplete) onComplete();
    }
  }, [isComplete, disabled, minScratchPercentage, onComplete]);

  // مدیریت رویدادهای ماوس و تاچ
  const handleMouseDown = useCallback(() => {
    if (!disabled) setIsScratching(true);
  }, [disabled]);

  const handleMouseMove = useCallback(
    (e) => {
      if (isScratching && !disabled) {
        scratch(e.clientX, e.clientY);
      }
    },
    [isScratching, disabled, scratch]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (isScratching && !disabled) {
        e.preventDefault(); // جلوگیری از اسکرول صفحه
        const touch = e.touches[0];
        scratch(touch.clientX, touch.clientY);
      }
    },
    [isScratching, disabled, scratch]
  );

  const handleEnd = useCallback(() => {
    setIsScratching(false);
    checkCompletion();
  }, [checkCompletion]);

  // اتصال ایونت‌لیسنرها فقط به کانواس
  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchstart", handleMouseDown);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("touchend", handleEnd);
    canvas.addEventListener("touchcancel", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseup", handleEnd);
      canvas.removeEventListener("touchend", handleEnd);
      canvas.removeEventListener("touchcancel", handleEnd);
    };
  }, [disabled, handleMouseDown, handleMouseMove, handleTouchMove, handleEnd]);

  return (
    <motion.div
      style={{
        position: "relative",
        width,
        height,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      {children}
    </motion.div>
  );
};