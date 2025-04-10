import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const EventsPageBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Particle system with updated colors to match theme
    class Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: { x: number; y: number };
      opacity: number;
      decay: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2.5 + 0.8;
        
        // Updated color palette to match theme
        const colors = [
          // Primary colors (pink/red)
          'rgba(244, 63, 94, 0.8)',  // #F43F5E with opacity
          'rgba(251, 113, 133, 0.8)', // Lighter pink
          'rgba(225, 29, 72, 0.8)',   // Darker pink
          
          // Secondary colors (indigo/purple)
          'rgba(79, 70, 229, 0.8)',   // #4F46E5 with opacity
          'rgba(129, 140, 248, 0.8)',  // Lighter indigo
          'rgba(99, 102, 241, 0.8)',   // Mid indigo
        ];
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.velocity = {
          x: (Math.random() - 0.5) * 0.6,
          y: (Math.random() - 0.5) * 0.6
        };
        this.opacity = Math.random() * 0.5 + 0.3;
        this.decay = 0.0008; // Slightly faster decay for more dynamic effect
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }

      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.opacity -= this.decay;

        if (this.x < 0 || this.x > width) this.velocity.x *= -1;
        if (this.y < 0 || this.y > height) this.velocity.y *= -1;

        this.draw();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    const particleCount = Math.min(120, width * height / 8000); // Increased particle count
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(
        Math.random() * width, 
        Math.random() * height
      ));
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, height);
      
      // Draw gradient background with theme colors
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(244, 63, 94, 0.03)"); // Very subtle primary color
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
      gradient.addColorStop(1, "rgba(79, 70, 229, 0.03)"); // Very subtle secondary color
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].opacity <= 0) {
          particles[i] = new Particle(
            Math.random() * width, 
            Math.random() * height
          );
        } else {
          particles[i].update();
        }
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) { // Increased connection distance
            // Gradient connection color based on theme
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y, 
              particles[j].x, particles[j].y
            );
            
            gradient.addColorStop(0, `rgba(244, 63, 94, ${(1 - distance / 120) * 0.15})`); // Primary color
            gradient.addColorStop(1, `rgba(79, 70, 229, ${(1 - distance / 120) * 0.15})`); // Secondary color
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(0.1, 1 - distance / 120);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-pink-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-pink-950/20 dark:to-indigo-950/20" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Animated orbs with theme colors */}
      <motion.div 
        className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.15, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div 
        className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-secondary/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.2, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Additional animated elements */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 20, 0],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div 
        className="absolute bottom-1/3 left-1/3 w-72 h-72 rounded-full bg-secondary/5 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -30, 0],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};

export default EventsPageBackground;