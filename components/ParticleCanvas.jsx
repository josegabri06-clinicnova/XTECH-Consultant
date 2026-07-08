'use client';

import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas({
  count = 35,
  maxDist = 120,
  speed = 0.12,
  mouseRadius = 200,
  baseColor = [148, 163, 184],
  accentColor = [37, 99, 235],
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const config = {
      count,
      maxDist,
      speed,
      mouseRadius,
      baseColor,
      accentColor,
    };

    let width, height;
    let particles = [];
    let canvasMouseX = -1000, canvasMouseY = -1000;
    let animationFrameId = null;
    let isVisible = false;
    let canvasRect = null;

    function updateCanvasRect() {
      if (canvas) {
        canvasRect = canvas.getBoundingClientRect();
      }
    }

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateCanvasRect();
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.radius = Math.random() * 1.5 + 0.5;
        this.baseAlpha = Math.random() * 0.4 + 0.1;
      }
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < config.count; i++) {
        particles.push(new Particle());
      }
    }

    function draw() {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Update positions
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse attraction
        const dx = canvasMouseX - p.x;
        const dy = canvasMouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.mouseRadius) {
          const force = (1 - dist / config.mouseRadius) * 0.02;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.maxDist) {
            const alpha = (1 - dist / config.maxDist) * 0.15;
            const [r, g, b] = config.baseColor;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        const dx = canvasMouseX - p.x;
        const dy = canvasMouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = dist < config.mouseRadius ? (1 - dist / config.mouseRadius) : 0;
        const alpha = p.baseAlpha + proximity * 0.5;
        const [r, g, b] = proximity > 0.3 ? config.accentColor : config.baseColor;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + proximity * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Glow for close particles
        if (proximity > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + proximity * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${proximity * 0.1})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    }

    const mouseMoveHandler = (e) => {
      canvasRect = canvas.getBoundingClientRect();
      canvasMouseX = e.clientX - canvasRect.left;
      canvasMouseY = e.clientY - canvasRect.top;
    };

    const mouseLeaveHandler = () => {
      canvasMouseX = -1000;
      canvasMouseY = -1000;
    };

    const resizeHandler = () => {
      resize();
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', mouseMoveHandler);
      parent.addEventListener('mouseleave', mouseLeaveHandler);
    }
    window.addEventListener('resize', resizeHandler);

    // Setup intersection observer for off-screen culling
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const previouslyVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !previouslyVisible) {
          cancelAnimationFrame(animationFrameId);
          draw();
        } else if (!isVisible && previouslyVisible) {
          cancelAnimationFrame(animationFrameId);
        }
      });
    }, { threshold: 0.01 });

    if (parent) {
      observer.observe(parent);
    }

    init();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (parent) {
        parent.removeEventListener('mousemove', mouseMoveHandler);
        parent.removeEventListener('mouseleave', mouseLeaveHandler);
      }
      window.removeEventListener('resize', resizeHandler);
    };
  }, [count, maxDist, speed, mouseRadius, baseColor, accentColor]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />;
}
