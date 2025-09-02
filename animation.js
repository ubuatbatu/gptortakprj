(function() {
  const canvas = document.getElementById('animationCanvas');
  const ctx = canvas.getContext('2d');

  // Set the desired canvas size
  const width = canvas.width = 1920;
  const height = canvas.height = 1080;

  // Load the image that will be disintegrated
  const img = new Image();
  img.src = 'gorsel.png';

  // Particle containers
  const disintegration = [];
  const frontDust = [];
  const backDust = [];

  // Image placement and sizing variables
  let imgX, imgY, imgW, imgH;

  // When the image loads, compute its placement and start the animation
  img.onload = function() {
    // Scale the image to occupy roughly a quarter of the canvas width
    const aspect = img.width / img.height;
    imgW = width * 0.25;
    imgH = imgW / aspect;
    // Position the image slightly above center to leave room for the reflection
    imgX = (width - imgW) / 2;
    imgY = (height - imgH) / 2 - 50;
    requestAnimationFrame(animate);
  };

  /**
   * Spawn small particles from the left half of the image to simulate disintegration.
   * Particles are only generated within the ellipse that bounds the image so they
   * originate from the visible area. They move leftwards and slightly up/down.
   */
  function spawnDisintegration() {
    for (let i = 0; i < 5; i++) {
      let x, y;
      // Attempt to find a random point inside the left half of the ellipse
      for (let attempts = 0; attempts < 10; attempts++) {
        const rx = Math.random() * (imgW / 2);
        x = imgX + rx;
        const ry = Math.random() * imgH;
        y = imgY + ry;
        const dx = (x - (imgX + imgW / 2)) / (imgW / 2);
        const dy = (y - (imgY + imgH / 2)) / (imgH / 2);
        if (dx * dx + dy * dy <= 1) {
          break;
        }
      }
      const size = 2 + Math.random() * 3;
      const vx = -(1 + Math.random() * 2);
      const vy = (Math.random() - 0.5) * 1;
      disintegration.push({ x, y, vx, vy, size, alpha: 1 });
    }
  }

  /**
   * Spawn large dust particles that travel across the screen from left to right in
   * front of the image. These particles are larger and move slower to create
   * a perspective effect.
   */
  function spawnFrontDust() {
    const count = 1;
    for (let i = 0; i < count; i++) {
      const size = 6 + Math.random() * 6;
      const x = -50;
      const y = imgY + imgH * 0.3 + Math.random() * (imgH * 0.4);
      const vx = 2 + Math.random() * 2;
      const vy = (Math.random() - 0.5) * 0.5;
      frontDust.push({ x, y, vx, vy, size, alpha: 1 });
    }
  }

  /**
   * Spawn small dust particles that move from right to left behind the image.
   * They are smaller and slightly more transparent to simulate distance.
   */
  function spawnBackDust() {
    const count = 1;
    for (let i = 0; i < count; i++) {
      const size = 1 + Math.random() * 2;
      const x = width + 50;
      const y = imgY + imgH * 0.2 + Math.random() * (imgH * 0.6);
      const vx = -(2 + Math.random() * 2);
      const vy = (Math.random() - 0.5) * 0.5;
      backDust.push({ x, y, vx, vy, size, alpha: 0.6 });
    }
  }

  /**
   * Generic particle update loop. Moves particles by their velocity, fades
   * them out over time, and removes them when they are offscreen or invisible.
   */
  function updateParticles(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.003;
      if (
        p.alpha <= 0 ||
        p.x < -100 ||
        p.x > width + 100 ||
        p.y < -100 ||
        p.y > height + 100
      ) {
        arr.splice(i, 1);
      }
    }
  }

  /**
   * Draw all particles in an array. Uses circular particles and individual
   * transparency values.
   */
  function drawParticles(arr) {
    arr.forEach((p) => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /**
   * Draw a soft shadow (dark ellipse) beneath the image to anchor it to the ground.
   */
  function drawShadow() {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    const ellX = imgX + imgW / 2;
    const ellY = imgY + imgH - 10;
    ctx.beginPath();
    ctx.ellipse(ellX, ellY, imgW * 0.5, imgH * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw a vertical reflection of the image below it. The reflection is faded
   * gradually using an overlay gradient to blend it into the background.
   */
  function drawReflection() {
    ctx.save();
    // Flip the canvas vertically to draw the reflected image
    ctx.scale(1, -1);
    const reflY = -(imgY + imgH * 2);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(img, imgX, reflY, imgW, imgH);
    ctx.restore();

    // Overlay a gradient to fade the reflection
    const grad = ctx.createLinearGradient(0, imgY + imgH, 0, imgY + imgH * 2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(imgX, imgY + imgH, imgW, imgH);
  }

  /**
   * Draw a radial light beam emanating from above the image. This is simply
   * an overlay that lightens the scene near the top of the object and fades out.
   */
  function drawLight() {
    const gradient = ctx.createRadialGradient(
      imgX + imgW / 2,
      imgY,
      imgW * 0.1,
      imgX + imgW / 2,
      imgY - imgH * 0.5,
      imgW * 1.5
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Main animation loop. Clears the canvas, spawns new particles, updates
   * existing ones, draws everything in the correct order (back dust, reflection,
   * shadow, image, disintegration dust, front dust, lighting) then requests the
   * next frame.
   */
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Spawn new particles at random intervals
    spawnDisintegration();
    if (Math.random() < 0.3) spawnFrontDust();
    if (Math.random() < 0.3) spawnBackDust();

    // Update all particle arrays
    updateParticles(backDust);
    updateParticles(frontDust);
    updateParticles(disintegration);

    // Draw layers
    drawParticles(backDust);
    drawReflection();
    drawShadow();
    ctx.drawImage(img, imgX, imgY, imgW, imgH);
    drawParticles(disintegration);
    drawParticles(frontDust);
    drawLight();

    requestAnimationFrame(animate);
  }
})();
