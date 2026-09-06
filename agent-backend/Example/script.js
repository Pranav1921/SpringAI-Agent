// AURA CYBER-X 2088 — Interactive 3D Sneaker Engine
(function() {
  'use strict';

  // --- State ---
  let currentAngle = 25; // degrees (0 - 360)
  let isAutoSpin = true;
  let isDragging = false;
  let startX = 0;
  let startAngle = 0;
  let currentColor = 'cyan';
  let currentSize = 'US 9.5';
  let cart = [];

  const COLOR_PALETTES = {
    cyan: { name: 'Cyber Cyan', primary: '#00f5ff', secondary: '#0077ff', accent: '#ffffff', glow: 'rgba(0, 245, 255, 0.4)' },
    gold: { name: 'Solar Flare Gold', primary: '#ffb703', secondary: '#fb8500', accent: '#fffbeb', glow: 'rgba(255, 183, 3, 0.4)' },
    violet: { name: 'Midnight Neon Violet', primary: '#d946ef', secondary: '#8b5cf6', accent: '#fdf4ff', glow: 'rgba(217, 70, 239, 0.4)' },
    obsidian: { name: 'Obsidian Stealth Carbon', primary: '#64748b', secondary: '#334155', accent: '#e2e8f0', glow: 'rgba(100, 116, 139, 0.3)' }
  };

  // --- Canvas Setup ---
  const canvas = document.getElementById('sneakerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width;
  const height = canvas.height;

  // --- Procedural 3D Sneaker Renderer ---
  function drawSneaker3D(angleDeg, colorKey) {
    ctx.clearRect(0, 0, width, height);

    const rad = (angleDeg * Math.PI) / 180;
    const cosVal = Math.cos(rad);
    const sinVal = Math.sin(rad);

    const palette = COLOR_PALETTES[colorKey] || COLOR_PALETTES.cyan;
    const centerX = width / 2;
    const centerY = height / 2 + 30;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Dynamic ground shadow
    ctx.beginPath();
    ctx.ellipse(0, 85, 190 * (0.8 + Math.abs(cosVal) * 0.2), 30, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.filter = 'blur(12px)';
    ctx.fill();
    ctx.filter = 'none';

    // Perspective scale calculation
    const viewScale = 1.0 + sinVal * 0.12;
    const perspectiveTilt = cosVal * 0.95;
    ctx.scale(perspectiveTilt * viewScale, viewScale);

    // 1. OUTSOLE (Grav-Foam Pneumatic Pods)
    ctx.beginPath();
    ctx.moveTo(-160, 55);
    ctx.bezierCurveTo(-140, 80, -60, 82, 0, 80);
    ctx.bezierCurveTo(80, 78, 140, 75, 165, 45);
    ctx.lineTo(150, 30);
    ctx.bezierCurveTo(110, 50, -40, 52, -150, 40);
    ctx.closePath();

    const outsoleGrad = ctx.createLinearGradient(-160, 40, 160, 80);
    outsoleGrad.addColorStop(0, '#0f172a');
    outsoleGrad.addColorStop(0.5, '#1e293b');
    outsoleGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = outsoleGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.primary;
    ctx.stroke();

    // 2. MIDSOLE (Kinetic Return Matrix)
    ctx.beginPath();
    ctx.moveTo(-150, 40);
    ctx.bezierCurveTo(-100, 50, 40, 48, 150, 30);
    ctx.lineTo(145, 12);
    ctx.bezierCurveTo(60, 25, -60, 22, -145, 20);
    ctx.closePath();

    const midGrad = ctx.createLinearGradient(-150, 15, 150, 40);
    midGrad.addColorStop(0, '#f8fafc');
    midGrad.addColorStop(0.5, palette.secondary);
    midGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = midGrad;
    ctx.fill();

    // 3. UPPER BODY (AeroWeave Monofilament Mesh)
    ctx.beginPath();
    ctx.moveTo(-145, 20);
    ctx.bezierCurveTo(-155, -20, -110, -75, -50, -65);
    ctx.bezierCurveTo(-20, -60, 20, -35, 70, -10);
    ctx.bezierCurveTo(110, 8, 140, 10, 145, 12);
    ctx.lineTo(150, 30);
    ctx.bezierCurveTo(40, 48, -100, 50, -150, 40);
    ctx.closePath();

    const upperGrad = ctx.createLinearGradient(-140, -70, 140, 30);
    upperGrad.addColorStop(0, '#090d16');
    upperGrad.addColorStop(0.4, '#131c2e');
    upperGrad.addColorStop(0.7, palette.secondary);
    upperGrad.addColorStop(1, '#0a0e1a');
    ctx.fillStyle = upperGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // 4. SIGNATURE NEON SPEED SWOOSH / STRIPE
    ctx.beginPath();
    ctx.moveTo(-90, -15);
    ctx.bezierCurveTo(-40, -45, 30, -35, 90, 5);
    ctx.bezierCurveTo(40, -10, -30, -15, -70, -5);
    ctx.closePath();

    ctx.fillStyle = palette.primary;
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // 5. CARBON FIBER HEEL CUP & LACE LOCK
    ctx.beginPath();
    ctx.arc(-110, -25, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#05070a';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = palette.primary;
    ctx.stroke();

    // Tech stamp text on sneaker heel
    ctx.font = '700 8px JetBrains Mono';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('AURA 2088', -130, -22);

    // 6. ADAPTIVE LACE CABLES
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const lx = -35 + i * 22;
      const ly = -52 + i * 11;
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 8, ly + 14);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- Animation Loop ---
  function renderLoop() {
    if (isAutoSpin && !isDragging) {
      currentAngle = (currentAngle + 0.65) % 360;
      updateAngleDisplay();
    }
    drawSneaker3D(currentAngle, currentColor);
    requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // --- Interactive Drag Rotation ---
  const canvasWrap = document.getElementById('canvasWrap');
  if (canvasWrap) {
    canvasWrap.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startAngle = currentAngle;
      isAutoSpin = false;
      updateSpinButton();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      currentAngle = (startAngle - deltaX * 0.7 + 360) % 360;
      updateAngleDisplay();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch Support for Mobile / Tablet
    canvasWrap.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startAngle = currentAngle;
        isAutoSpin = false;
        updateSpinButton();
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - startX;
      currentAngle = (startAngle - deltaX * 0.7 + 360) % 360;
      updateAngleDisplay();
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  function updateAngleDisplay() {
    const angleEl = document.getElementById('angleValue');
    if (angleEl) {
      angleEl.textContent = `${Math.round(currentAngle)}°`;
    }
  }

  function updateSpinButton() {
    const btn = document.getElementById('btnAutoSpin');
    const status = document.getElementById('spinStatus');
    if (btn && status) {
      if (isAutoSpin) {
        btn.classList.add('active');
        status.textContent = 'ON';
      } else {
        btn.classList.remove('active');
        status.textContent = 'OFF';
      }
    }
  }

  // Auto-Spin & Reset Angle Buttons
  document.getElementById('btnAutoSpin')?.addEventListener('click', () => {
    isAutoSpin = !isAutoSpin;
    updateSpinButton();
  });

  document.getElementById('btnResetAngle')?.addEventListener('click', () => {
    currentAngle = 0;
    updateAngleDisplay();
  });

  // --- Colorway Switcher ---
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const colorNameDisplay = document.getElementById('selectedColorName');

  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      const target = (e.currentTarget);
      target.classList.add('active');
      currentColor = target.dataset.color || 'cyan';
      if (colorNameDisplay) {
        colorNameDisplay.textContent = target.dataset.name || 'Custom';
      }
      showToast(`Applied ${target.dataset.name} Colorway`);
    });
  });

  // --- Size Selector ---
  const sizeBoxes = document.querySelectorAll('.size-box');
  sizeBoxes.forEach(box => {
    box.addEventListener('click', (e) => {
      sizeBoxes.forEach(b => b.classList.remove('active'));
      const target = (e.currentTarget);
      target.classList.add('active');
      currentSize = target.dataset.size || 'US 9.5';
    });
  });

  // --- Wishlist Toggle ---
  const btnWishlist = document.getElementById('btnWishlist');
  const heartIcon = document.getElementById('heartIcon');
  let isWishlisted = false;
  btnWishlist?.addEventListener('click', () => {
    isWishlisted = !isWishlisted;
    if (heartIcon) {
      heartIcon.textContent = isWishlisted ? '❤️' : '🤍';
    }
    showToast(isWishlisted ? 'Added CYBER-X to your Wishlist' : 'Removed from Wishlist');
  });

  // --- Cart Drawer System ---
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');
  const btnCartToggle = document.getElementById('btnCartToggle');
  const btnCloseCart = document.getElementById('btnCloseCart');
  const btnAddToCart = document.getElementById('btnAddToCart');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const drawerCount = document.getElementById('drawerCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');

  function openCart() {
    cartBackdrop?.classList.remove('hidden');
    cartDrawer?.classList.remove('hidden');
    renderCart();
  }

  function closeCart() {
    cartBackdrop?.classList.add('hidden');
    cartDrawer?.classList.add('hidden');
  }

  btnCartToggle?.addEventListener('click', openCart);
  btnCloseCart?.addEventListener('click', closeCart);
  cartBackdrop?.addEventListener('click', closeCart);

  btnAddToCart?.addEventListener('click', () => {
    const pal = COLOR_PALETTES[currentColor];
    const newItem = {
      id: Date.now(),
      name: 'CYBER-X PRO RUNNER',
      colorway: pal.name,
      size: currentSize,
      price: 349.00,
      color: pal.primary
    };
    cart.push(newItem);
    updateCartBadges();
    openCart();
    showToast(`Added ${pal.name} (${currentSize}) to your bag!`);
  });

  function updateCartBadges() {
    const total = cart.length;
    if (cartCountBadge) cartCountBadge.textContent = total;
    if (drawerCount) drawerCount.textContent = total;
  }

  function renderCart() {
    if (!cartItemsList) return;
    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: #94a3b8;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛍️</div>
          <p style="font-weight: 700; color: #fff;">Your bag is empty</p>
          <p style="font-size: 0.8rem; margin-top: 4px;">Choose a colorway & size to customize your pair.</p>
        </div>
      `;
      if (cartSubtotal) cartSubtotal.textContent = '$0.00';
      return;
    }

    cartItemsList.innerHTML = cart.map(item => `
      <div class="cart-item-card">
        <div class="item-thumbnail" style="background: ${item.color}22; border: 1px solid ${item.color}55;">
          👟
        </div>
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-meta">${item.colorway} // Size: ${item.size}</div>
          <div class="item-price">$${item.price.toFixed(2)}</div>
        </div>
        <button class="btn-remove-item" data-id="${item.id}" title="Remove item">✕</button>
      </div>
    `).join('');

    const sum = cart.reduce((acc, i) => acc + i.price, 0);
    if (cartSubtotal) cartSubtotal.textContent = `$${sum.toFixed(2)}`;

    // Remove item listeners
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number((e.currentTarget).dataset.id);
        cart = cart.filter(i => i.id !== id);
        updateCartBadges();
        renderCart();
      });
    });
  }

  document.getElementById('btnProceedCheckout')?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your bag is empty!');
      return;
    }
    showToast('🚀 Redirecting to Secure Encrypted Checkout...');
  });

  // --- Toast Notification ---
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
  }

})();
