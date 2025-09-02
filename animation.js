(function() {
  const canvas = document.getElementById('animationCanvas');
  const ctx = canvas.getContext('2d');

  const width = canvas.width;
  const height = canvas.height;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35; // radius relative to canvas size

  // Array to hold particle objects
  const particles = [];

  /**
   * Spawn a new particle from a random point on the left half of the circle.
   * Each particle has a starting position (x, y), a velocity (vx, vy)
   * and an alpha value that will fade over time.
   */
  function spawnParticle() {
    // Random angle on the left half: from 90° (π/2) to 270° (3π/2)
    const angle = Math.random() * Math.PI + Math.PI / 2;
    // Random radius multiplier so points are spread throughout the half circle
    const r = Math.sqrt(Math.random()) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);

    // Particles drift leftwards with slight up/down variation
    const vx = - (Math.random() * 1.5 + 0.5);
    const vy = (Math.random() - 0.5) * 0.6;

    particles.push({ x, y, vx, vy, alpha: 1 });
  }

  /**
   * Update all particles: move them by their velocity and decrease alpha.
   * Particles that move offscreen or fade out completely are removed.
   */
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.01;
      // Remove particles that are fully transparent or outside bounds
      if (p.alpha <= 0 || p.x < -50 || p.y < -50 || p.y > height + 50) {
        particles.splice(i, 1);
      }
    }
  }

  /**
   * Draw the right half of the circle. We use arc to draw from -90° (top) to 90° (bottom).
   */
  function drawRightHalf() {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2, false);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  /**
   * Draw all particles with varying transparency.
   */
  function drawParticles() {
    ctx.fillStyle = '#ffffff';
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      // Draw small squares to represent dust. We could draw circles, but squares are fine.
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1;
  }

  /**
   * Animation loop: clear the canvas, draw the right half, spawn new particles,
   * update existing particles and draw them. Use requestAnimationFrame for smooth animation.
   */
  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawRightHalf();

    // Spawn several new particles each frame to give a continuous dust effect
    for (let i = 0; i < 5; i++) {
      spawnParticle();
    }

    updateParticles();
    drawParticles();

    requestAnimationFrame(animate);
  }

  // Start the animation
  animate();
})();
