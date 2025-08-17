/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

const DefaultCursorSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={50}
    height={54}
    viewBox="0 0 50 54"
    fill="none"
    style={{ scale: 0.5 }}
  >
    <g filter="url(#filter0_d_91_7928)">
      <path
        d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
        fill="black"
      />
      <path
        d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
        stroke="white"
        strokeWidth={2.25825}
      />
    </g>
    <defs>
      <filter
        id="filter0_d_91_7928"
        x={0.602397}
        y={0.952444}
        width={49.0584}
        height={52.428}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={2.25825} />
        <feGaussianBlur stdDeviation={2.25825} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_91_7928"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_91_7928"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  springConfig = { damping: 45, stiffness: 400, mass: 1, restDelta: 0.001 },
}) {
  const [isHidden, setIsHidden] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.matchMedia("(min-width: 1024px)").matches);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, { ...springConfig, damping: 60, stiffness: 300 });
  const scale = useSpring(1, { ...springConfig, stiffness: 500, damping: 35 });

  useEffect(() => {
    // بررسی تغییرات اندازه صفحه برای تشخیص دسکتاپ
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleMediaChange = (e) => {
      setIsDesktop(e.matches);
      document.body.style.cursor = e.matches ? "none" : "auto";
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    handleMediaChange(mediaQuery); // بررسی اولیه

    const updateVelocity = (currentPos) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        };
      }

      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
    };

    const shouldHideCursor = (target) => {
      const modalElements = document.querySelectorAll('.MuiModal-root, .MuiDialog-root, [role="dialog"]');
      for (const modal of modalElements) {
        if (modal.contains(target)) {
          return true;
        }
      }
      return false;
    };

    const smoothMouseMove = (e) => {
      if (!isDesktop) return; // فقط در دسکتاپ اجرا شود

      const currentPos = { x: e.clientX, y: e.clientY };
      updateVelocity(currentPos);

      const hide = shouldHideCursor(e.target);
      setIsHidden(hide);

      if (hide) {
        document.body.style.cursor = "auto";
        return;
      } else {
        document.body.style.cursor = "none";
      }

      const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);

      cursorX.set(currentPos.x);
      cursorY.set(currentPos.y);

      if (speed > 0.1) {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;

        let angleDiff = currentAngle - previousAngle.current;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        accumulatedRotation.current += angleDiff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = currentAngle;

        scale.set(0.95);
        const timeout = setTimeout(() => {
          scale.set(1);
        }, 150);

        return () => clearTimeout(timeout);
      }
    };

    let rafId;
    const throttledMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e);
        rafId = 0;
      });
    };

    if (isDesktop) {
      document.body.style.cursor = "none";
      window.addEventListener("mousemove", throttledMouseMove);
    }

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", throttledMouseMove);
      document.body.style.cursor = "auto";
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cursorX, cursorY, rotation, scale, isDesktop, cursor]);

  if (!isDesktop) return null; // در تبلت و موبایل رندر نشود

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rotation,
        scale: scale,
        pointerEvents: "none",
        willChange: "transform",
        zIndex: 9999,
        display: isHidden ? "none" : "block",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {cursor}
    </motion.div>
  );
}

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];
const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const int = parseInt(hex, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec4 random;
attribute vec3 color;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uSpread;
uniform float uBaseSize;
uniform float uSizeRandomness;

varying vec4 vRandom;
varying vec3 vColor;

void main() {
  vRandom = random;
  vColor = color;

  vec3 pos = position * uSpread;
  pos.z *= 10.0;

  vec4 mPos = modelMatrix * vec4(pos,1.0);
  float t = uTime;
  mPos.x += sin(t*random.z+6.28*random.w)*mix(0.1,1.5,random.x);
  mPos.y += sin(t*random.y+6.28*random.x)*mix(0.1,1.5,random.w);
  mPos.z += sin(t*random.w+6.28*random.y)*mix(0.1,1.5,random.z);

  vec4 mvPos = viewMatrix * mPos;
  gl_PointSize = (uBaseSize*(1.0 + uSizeRandomness*(random.x-0.5))) / length(mvPos.xyz);
  gl_Position = projectionMatrix*mvPos;
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uAlphaParticles;
varying vec4 vRandom;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord.xy;
  float d = length(uv-vec2(0.5));
  if(uAlphaParticles<0.5){
    if(d>0.5) discard;
    gl_FragColor = vec4(vColor+0.2*sin(uv.yxx+uTime+vRandom.y*6.28),1.0);
  } else {
    float circle = smoothstep(0.5,0.4,d)*0.8;
    gl_FragColor = vec4(vColor+0.2*sin(uv.yxx+uTime+vRandom.y*6.28),circle);
  }
}
`;

const BackgroundWithCursor = ({
  children,
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className,
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ depth: false, alpha: true });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvasRef.current = canvas;

    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1";
    document.body.appendChild(canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };

    window.addEventListener("resize", resize);
    resize();

    const mousePos = { x: 0, y: 0 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    if (moveParticlesOnHover) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = particleColors?.length ? particleColors : defaultColors;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random());

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions.set([x, y, z], i * 3);

      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);

      const color = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(color, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrame;
    let lastTime = 0;
    let elapsed = 0;

    const animate = (time) => {
      animationFrame = requestAnimationFrame(animate);

      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;
      elapsed += delta * speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (moveParticlesOnHover) {
        particles.position.x = -mousePos.x * particleHoverFactor;
        particles.position.y = -mousePos.y * particleHoverFactor;
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }

      renderer.render({ scene: particles, camera });
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (moveParticlesOnHover) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
      cancelAnimationFrame(animationFrame);
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
      }
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    particleColors,
  ]);

  return (
    <div
      ref={containerRef}
      className={`particles-container ${className || ''}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {children}
      <SmoothCursor />
    </div>
  );
};

export default BackgroundWithCursor;