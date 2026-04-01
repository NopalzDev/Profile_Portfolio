// apply saved theme immediately to avoid flash
(function(){
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

// inject shared head elements once for all pages
(function(){
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.href = 'assets/mylogo.png';
  document.head.appendChild(favicon);

  const boxicons = document.createElement('link');
  boxicons.rel = 'stylesheet';
  boxicons.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
  document.head.appendChild(boxicons);

  const devicons = document.createElement('link');
  devicons.rel = 'stylesheet';
  devicons.href = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css';
  document.head.appendChild(devicons);
})();

async function loadPartial(mountId, filePath) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  try {
    const res = await fetch(filePath, { cache: "no-store" });
    if (!res.ok) throw new Error(`${filePath} not found (HTTP ${res.status})`);
    mount.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
    mount.innerHTML = `
      <div style="padding:12px;border:1px solid #e9e9e9;border-radius:12px;font-weight:800;color:#b00020;text-align:center">
        Failed to load: ${filePath}
      </div>
    `;
  }
}

function highlightActiveNav() {
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === current) a.classList.add("active");
  });
}

function setFooterYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = year));
}

/* Parallax for elements with data-parallax (uses wrappers so it won't break CSS animations) */
function setupParallax() {
  const layers = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!layers.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  const onMove = (e) => {
    const point = e.touches?.[0] || e;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    targetX = (point.clientX - cx) / cx; // -1..1
    targetY = (point.clientY - cy) / cy; // -1..1
  };

  window.addEventListener("pointermove", onMove, { passive: true });

  const animate = () => {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;

    layers.forEach(el => {
      const strength = parseFloat(el.dataset.parallax || "0.06");
      const moveX = currentX * 80 * strength;
      const moveY = currentY * 80 * strength;
      el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

/* Tilt for elements with data-tilt */
function setupTilt() {
  const cards = Array.from(document.querySelectorAll("[data-tilt]"));
  if (!cards.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  cards.forEach(card => {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const zoom = parseFloat(card.dataset.tiltZoom || "1");
    let currentScale = 1, targetScale = 1;

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      tx = Math.max(-1, Math.min(1, x));
      ty = Math.max(-1, Math.min(1, y));
    };

    const onEnter = () => { targetScale = zoom; };
    const onLeave = () => { tx = 0; ty = 0; targetScale = 1; };

    card.addEventListener("mousemove", onMove, { passive: true });
    card.addEventListener("mouseenter", onEnter, { passive: true });
    card.addEventListener("mouseleave", onLeave, { passive: true });

    const animate = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      currentScale += (targetScale - currentScale) * 0.08;

      const rotY = cx * 6;
      const rotX = -cy * 6;
      const moveX = cx * 6;
      const moveY = cy * 6;

      card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${currentScale})`;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });
}

function setupCard3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll("[data-card3d]").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rotY = (x - 0.5) * 20;
      const rotX = -(y - 0.5) * 20;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
      card.style.boxShadow = `${-rotY}px ${rotX}px 30px rgba(52,211,153,0.25), 0 0 20px rgba(52,211,153,0.15)`;
      card.style.borderColor = `var(--mint)`;
    }, { passive: true });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)`;
      card.style.boxShadow = "";
      card.style.borderColor = "";
    }, { passive: true });
  });
}

function sendEmail(e, form) {
  e.preventDefault();
  const name    = form[0].value.trim();
  const subject = form[1].value.trim();
  const message = form[2].value.trim();
  const body    = 'Name: ' + name + '\n\n' + message;
  window.location.href = 'mailto:youremail@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

function sendWhatsApp(e, form) {
  e.preventDefault();
  const name    = form[0].value.trim();
  const email   = form[1].value.trim();
  const message = form[2].value.trim();
  const text    = 'Name: ' + name + '\nEmail: ' + email + '\nMessage: ' + message;
  window.open('https://wa.me/60123456789?text=' + encodeURIComponent(text), '_blank');
}

(async () => {
  await loadPartial("site-bg", "./components/bg.html");
  setupParallax();

  await loadPartial("site-nav", "./components/nav.html");
  highlightActiveNav();

  // sync dark mode icon after nav loads
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const themeIcon = document.querySelector('.navTheme i');
  if (themeIcon) themeIcon.className = isDark ? 'bx bx-sun' : 'bx bx-moon';

  await loadPartial("site-footer", "./components/footer.html");
  setFooterYear();

  setupTilt();
  setupCard3D();
})();