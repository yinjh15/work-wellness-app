 class ParticleSystem {
   constructor(canvas) {
     this.canvas = canvas;
     this.ctx = canvas.getContext("2d");
     this.particles = [];
     this.animationId = null;
     this.isActive = false;
     this.resize();
     window.addEventListener("resize", () => this.resize());
   }
 
   resize() {
     this.canvas.width = window.innerWidth;
     this.canvas.height = window.innerHeight;
   }
 
   start(count = 50) {
     if (this.isActive) return;
     this.isActive = true;
     this.particles = [];
     for (let i = 0; i < count; i++) {
       this.particles.push(this.createParticle());
     }
     this.animate();
   }
 
   stop() {
     this.isActive = false;
     if (this.animationId) {
       cancelAnimationFrame(this.animationId);
       this.animationId = null;
     }
     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }
 
   setActive(active) {
     if (active && !this.isActive) {
       this.start();
     } else if (!active && this.isActive) {
       this.stop();
     }
   }
 
   createParticle() {
     const speedFactor = 0.4 + Math.random() * 0.8;
     return {
       x: Math.random() * this.canvas.width,
       y: Math.random() * this.canvas.height,
       size: 1.5 + Math.random() * 3.5,
       speedX: (-0.3 + Math.random() * 0.6) * speedFactor,
       speedY: (-0.4 - Math.random() * 0.6) * speedFactor,
       opacity: 0.15 + Math.random() * 0.4,
       hue: 270 + Math.random() * 30,
     };
   }
 
   animate() {
     if (!this.isActive) return;
     const w = this.canvas.width;
     const h = this.canvas.height;
     const ctx = this.ctx;
     ctx.clearRect(0, 0, w, h);
 
     for (let i = 0; i < this.particles.length; i++) {
       const p = this.particles[i];
       p.x += p.speedX;
       p.y += p.speedY;
       if (p.x < -20) p.x = w + 20;
       if (p.x > w + 20) p.x = -20;
       if (p.y < -20) p.y = h + 20;
       if (p.y > h + 20) p.y = -20;
 
       ctx.beginPath();
       ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
       ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
       ctx.fill();
 
       ctx.beginPath();
       ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
       ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity * 0.12})`;
       ctx.fill();
 
       for (let j = i + 1; j < this.particles.length; j++) {
         const other = this.particles[j];
         const dx = p.x - other.x;
         const dy = p.y - other.y;
         const dist = Math.hypot(dx, dy);
         if (dist < 120) {
           ctx.beginPath();
           ctx.moveTo(p.x, p.y);
           ctx.lineTo(other.x, other.y);
           ctx.strokeStyle = `hsla(280, 60%, 70%, ${(1 - dist / 120) * 0.08})`;
           ctx.lineWidth = 0.5;
           ctx.stroke();
         }
       }
     }
     this.animationId = requestAnimationFrame(() => this.animate());
   }
 }
