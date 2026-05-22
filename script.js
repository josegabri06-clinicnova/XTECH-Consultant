/* ═══════════════════════════════════════════════════════
   XTech Consultant — Cinematic Interactive Engine
   Particle canvas, custom cursor, magnetic buttons,
   word-by-word reveals, and smooth animations.
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── UTILS ──────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;
  let globalScrollVelocity = 0;

  // ── PAGE LOAD ──────────────────────────────────────
  const overlay = $('#page-overlay');
  window.addEventListener('load', () => {
    requestAnimationFrame(() => overlay.classList.add('loaded'));
    overlay.addEventListener('transitionend', () => overlay.style.display = 'none');
  });

  // ── CUSTOM CURSOR ──────────────────────────────────
  const cursor = $('#cursor');
  const cursorDot = $('.cursor-dot');
  const cursorRing = $('.cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  // Smooth ring follow
  function animateCursor() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Cursor hover states
  const hoverTargets = $$('a, button, summary, .magnetic-btn');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // ── MAGNETIC BUTTONS ───────────────────────────────
  const magneticBtns = $$('.magnetic-btn');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });

  // ── NAVBAR ─────────────────────────────────────────
  const navbar = $('#navbar');

  function handleNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  // ── SCROLL PROGRESS ────────────────────────────────
  const scrollProgress = $('#scroll-progress');

  function updateProgress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
  }

  // ── HAMBURGER ──────────────────────────────────────
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  $$('a', mobileMenu).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ── SCROLL REVEAL ──────────────────────────────────
  const revealObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  $$('.reveal-up').forEach(el => revealObserver.observe(el));

  // ── CINEMA TEXT (Word-by-word reveal on scroll) ────
  function setupCinemaText() {
    $$('[data-reveal="words"]').forEach(el => {
      const text = el.textContent.trim();
      el.innerHTML = '';
      text.split(/\s+/).forEach(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        el.appendChild(span);
      });
    });
  }
  setupCinemaText();

  function updateCinemaText() {
    $$('[data-reveal="words"]').forEach(el => {
      const words = $$('.word', el);
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: 0 when element enters bottom, 1 when it's at top
      const progress = 1 - (rect.top / (vh * 0.7));
      const clampedProgress = Math.max(0, Math.min(1, progress));

      words.forEach((word, i) => {
        const wordProgress = i / words.length;
        word.classList.toggle('lit', clampedProgress > wordProgress);
      });
    });
  }

  // ── ANIMATED COUNTERS ──────────────────────────────
  const counterAnimated = new Set();

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // Ease out quart
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting && !counterAnimated.has(e.target)) {
        counterAnimated.add(e.target);
        animateCounter(e.target);
      }
    }),
    { threshold: 0.5 }
  );

  $$('[data-target]').forEach(el => counterObserver.observe(el));

  // ── PARTICLE CANVAS ────────────────────────────────
  function initParticles(canvasId, opts = {}) {
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const config = {
      count: opts.count || 80,
      maxDist: opts.maxDist || 150,
      speed: opts.speed || 0.3,
      mouseRadius: opts.mouseRadius || 200,
      baseColor: opts.baseColor || [34, 211, 238],
      accentColor: opts.accentColor || [52, 211, 153],
    };

    let width, height;
    let particles = [];
    let canvasMouseX = -1000, canvasMouseY = -1000;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
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

        // Apply scroll-warp physics
        // As scroll velocity increases, stretch particles vertically
        const velocityEffect = globalScrollVelocity * 1.5;
        
        ctx.beginPath();
        if (Math.abs(velocityEffect) > 0.25) {
          // Draw warp streak lines
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = p.radius + proximity * 1.5;
          ctx.moveTo(p.x, p.y);
          // Stretch vertically based on velocity
          ctx.lineTo(p.x, p.y - velocityEffect * (p.radius * 8));
          ctx.stroke();
        } else {
          // Draw standard circular node
          ctx.arc(p.x, p.y, p.radius + proximity * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fill();
        }

        // Glow for close particles
        if (proximity > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + proximity * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${proximity * 0.1})`;
          ctx.fill();
        }
      });

      requestAnimationFrame(draw);
    }

    // Mouse tracking relative to canvas
    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      canvasMouseX = e.clientX - rect.left;
      canvasMouseY = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
      canvasMouseX = -1000;
      canvasMouseY = -1000;
    });

    window.addEventListener('resize', () => {
      resize();
    });

    init();
    draw();
  }

  // Init hero canvas
  initParticles('#particle-canvas', {
    count: 90,
    maxDist: 160,
    speed: 0.35,
    mouseRadius: 220,
    baseColor: [34, 211, 238],
    accentColor: [56, 189, 248],
  });

  // Init CTA canvas (smaller, subtler)
  initParticles('#cta-canvas', {
    count: 40,
    maxDist: 120,
    speed: 0.2,
    mouseRadius: 180,
    baseColor: [52, 211, 153],
    accentColor: [34, 211, 238],
  });

  // ── SMOOTH ANCHOR SCROLL ───────────────────────────
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── FAQ SMOOTH CLOSE ───────────────────────────────
  $$('.faq-item').forEach(details => {
    details.addEventListener('click', (e) => {
      if (e.target.closest('summary') && details.open) {
        e.preventDefault();
        const answer = details.querySelector('.faq-answer');
        answer.style.overflow = 'hidden';
        answer.style.maxHeight = answer.scrollHeight + 'px';
        requestAnimationFrame(() => {
          answer.style.transition = 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease';
          answer.style.maxHeight = '0';
          answer.style.opacity = '0';
        });
        answer.addEventListener('transitionend', function handler() {
          details.open = false;
          answer.style.removeProperty('max-height');
          answer.style.removeProperty('opacity');
          answer.style.removeProperty('overflow');
          answer.style.removeProperty('transition');
          answer.removeEventListener('transitionend', handler);
        });
      }
    });
  });

  // ── LENIS SMOOTH SCROLL & UNIFIED SCROLL ENGINE ────
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential deceleration
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 0.9,
      smoothTouch: false,
      infinite: false,
    });

    lenis.on('scroll', (e) => {
      // Capture velocity (pixels/ms)
      globalScrollVelocity = e.velocity;
      
      // Execute unified page scroll elements
      handleNavbar();
      updateProgress();
      updateCinemaText();
    });

    // Integrated RequestAnimationFrame loop for Lenis ticks & inertia deceleration
    function raf(time) {
      lenis.raf(time);
      
      // Decelerate the velocity smoothly back to 0 when scrolling stops
      if (Math.abs(globalScrollVelocity) > 0.02) {
        globalScrollVelocity = lerp(globalScrollVelocity, 0, 0.08);
      } else {
        globalScrollVelocity = 0;
      }
      
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } else {
    // Elegant fallback if Lenis CDN is blocked or unavailable
    let lastScrollY = window.scrollY;
    let velocityTimeout = null;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      globalScrollVelocity = (currentScrollY - lastScrollY) * 0.15;
      lastScrollY = currentScrollY;

      clearTimeout(velocityTimeout);
      velocityTimeout = setTimeout(() => {
        globalScrollVelocity = 0;
      }, 100);

      handleNavbar();
      updateProgress();
      updateCinemaText();
    }, { passive: true });
  }

  // Handle default initial calls
  handleNavbar();
  updateProgress();
  updateCinemaText();

  // ── DYNAMIC AMBIENT GLOW CHANGER ───────────────────
  const sections = $$('section[id]');
  const ambientColors = {
    hero: 'rgba(34, 211, 238, 0.04)',       // Cyber Cyan
    dolor: 'rgba(244, 63, 94, 0.07)',       // Crimson Alert
    solucion: 'rgba(16, 185, 129, 0.05)',    // Emerald Alleviation
    servicios: 'rgba(56, 189, 248, 0.05)',   // Sky Blue Tech
    proyectos: 'rgba(139, 92, 246, 0.05)',   // Violet Production
    proceso: 'rgba(251, 191, 36, 0.05)',     // Amber Path
    diferenciacion: 'rgba(34, 211, 238, 0.04)',
    testimonios: 'rgba(16, 185, 129, 0.05)',
    faq: 'rgba(139, 92, 246, 0.05)',
    contacto: 'rgba(251, 146, 60, 0.07)'     // Gold final CTA
  };

  const ambientObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const color = ambientColors[id];
        if (color) {
          document.documentElement.style.setProperty('--ambient-glow', color);
        }
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(sec => ambientObserver.observe(sec));

  // ══════════════════════════════════════════════════════
  // PROJECT MODAL — Immersive Full-Screen Experience
  // ══════════════════════════════════════════════════════

  const projectData = {
    clinicnova: {
      tag: 'Salud',
      tagClass: 'tag-emerald',
      name: 'ClinicNova',
      subtitle: 'Gestión integral de clínicas con recordatorios inteligentes por WhatsApp, citas online y cobros automatizados con Stripe.',
      bigStat: '-61%',
      bigLabel: 'ausencias de pacientes',
      colors: { base: [52, 211, 153], accent: [34, 211, 238] },
      problem: {
        title: 'Las clínicas pierden 4 horas al día llamando a pacientes que no van a venir',
        text: 'El personal de recepción dedica la mitad de su jornada a llamar uno a uno para confirmar citas. Los pacientes no contestan, olvidan las citas, y las clínicas pierden ingresos por huecos vacíos. El resultado: un equipo frustrado, huecos sin cubrir y una facturación muy por debajo de su capacidad real.'
      },
      solution: {
        title: 'Un sistema que confirma, recuerda y cobra sin intervención humana',
        text: 'ClinicNova envía recordatorios automáticos por WhatsApp 48h y 2h antes de cada cita. El paciente confirma, cancela o reagenda con un solo clic. Si cancela, el sistema ofrece el hueco a otros pacientes en lista de espera. Después de la consulta, el cobro se procesa automáticamente con Stripe. Cero llamadas. Cero persecuciones.'
      },
      steps: [
        { title: 'Paciente reserva online', desc: 'Calendario inteligente integrado en la web de la clínica. El paciente elige día, hora y especialista.' },
        { title: 'WhatsApp automático 48h antes', desc: 'El sistema envía recordatorio con botones de confirmar, cancelar o reagendar. Sin instalar nada.' },
        { title: 'Confirmación o reasignación', desc: 'Si cancela, el hueco se ofrece automáticamente al siguiente paciente en lista de espera.' },
        { title: 'Cobro con Stripe post-consulta', desc: 'Facturación automática tras la visita. Sin pasar por caja. Sin fricción.' }
      ],
      metrics: [
        { value: '-61%', label: 'Menos ausencias' },
        { value: '4h/día', label: 'Tiempo ahorrado' },
        { value: '98%', label: 'Tasa de lectura WhatsApp' },
        { value: '3 sem', label: 'Tiempo hasta resultados' }
      ],
      tech: ['n8n', 'WhatsApp Business API', 'Stripe', 'Supabase', 'Next.js', 'PostgreSQL', 'Webhooks', 'Cron Jobs']
    },

    kontai: {
      tag: 'Contabilidad',
      tagClass: 'tag-cyan',
      name: 'KontAI',
      subtitle: 'OCR con inteligencia artificial que lee facturas, extrae datos contables, calcula impuestos y exporta a tu gestoría en segundos.',
      bigStat: '4.2s',
      bigLabel: 'por factura procesada',
      colors: { base: [34, 211, 238], accent: [56, 189, 248] },
      problem: {
        title: '20 minutos por factura. Multiplicado por 200 facturas al mes.',
        text: 'Los despachos contables y departamentos financieros procesan cientos de facturas manualmente cada mes. Abrir el PDF, leer el emisor, copiar el NIF, el importe, la base imponible, el tipo de IVA, la retención de IRPF... todo a mano. Un error de transcripción puede costar multas de Hacienda. Y el equipo vive en un estado permanente de estrés.'
      },
      solution: {
        title: 'IA que lee, clasifica y exporta facturas en 4.2 segundos',
        text: 'KontAI recibe facturas por email, WhatsApp o subida manual. GPT-4 con OCR extrae todos los campos contables: emisor, NIF/CIF, base imponible, tipo de IVA, retención IRPF, fecha, número de factura. Clasifica automáticamente el gasto por categoría contable y exporta a Holded, A3 o cualquier ERP. Sin copiar ni pegar. Sin errores humanos.'
      },
      steps: [
        { title: 'Recepción automática', desc: 'La factura llega por email, WhatsApp o se sube manualmente. El sistema la detecta automáticamente.' },
        { title: 'OCR + GPT-4 extrae datos', desc: 'Lee el documento, identifica campos (NIF, importes, IVA, IRPF) y estructura la información en formato contable.' },
        { title: 'Clasificación inteligente', desc: 'Asigna categoría contable, detecta duplicados y marca anomalías para revisión humana.' },
        { title: 'Exportación a ERP', desc: 'Los datos salen listos para Holded, A3 o Excel. Un clic y están en tu gestoría.' }
      ],
      metrics: [
        { value: '4.2s', label: 'Por factura' },
        { value: '99.2%', label: 'Precisión OCR' },
        { value: '200+', label: 'Facturas/mes procesadas' },
        { value: '20min→4s', label: 'Antes vs ahora' }
      ],
      tech: ['GPT-4 Vision', 'OCR avanzado', 'n8n', 'Holded API', 'Supabase', 'WhatsApp API', 'Gmail API', 'PDF Parser']
    },

    '4stancias': {
      tag: 'Turismo',
      tagClass: 'tag-amber',
      name: '4Stancias',
      subtitle: 'Automatización total de gestión de apartamentos turísticos. Reservas, check-in digital, mensajes automáticos y coordinación de limpieza.',
      bigStat: '30min',
      bigLabel: 'de gestión por semana',
      colors: { base: [251, 191, 36], accent: [251, 146, 60] },
      problem: {
        title: 'Gestionar 10 apartamentos te roba 30 horas a la semana',
        text: 'Cada reserva genera una cascada de tareas: responder al huésped, enviar instrucciones de check-in, coordinar limpieza, sincronizar calendarios entre Booking, Airbnb y la web propia, gestionar depósitos de seguridad, enviar códigos de acceso... Un propietario con 10 apartamentos pasa más tiempo gestionando que viviendo.'
      },
      solution: {
        title: 'Todo automatizado. Solo 30 minutos a la semana.',
        text: '4Stancias sincroniza todas las OTAs en tiempo real, envía mensajes automáticos al huésped en cada fase (pre-llegada, check-in, check-out), coordina la limpieza automáticamente con el equipo, genera check-in digital con documentación legal, y centraliza toda la comunicación en un solo panel. El propietario pasa de 30 horas a 30 minutos semanales.'
      },
      steps: [
        { title: 'Reserva detectada', desc: 'El sistema detecta la nueva reserva en cualquier OTA o directa y sincroniza calendarios automáticamente.' },
        { title: 'Mensajes pre-llegada', desc: 'WhatsApp automático al huésped: instrucciones de llegada, código de acceso, normas de la casa.' },
        { title: 'Check-in digital', desc: 'El huésped sube su documentación desde el móvil. Se genera el parte de viajeros para la policía automáticamente.' },
        { title: 'Coordinación de limpieza', desc: 'Al hacer checkout, el equipo de limpieza recibe la alerta con los detalles del próximo huésped.' }
      ],
      metrics: [
        { value: '30min', label: 'Gestión semanal' },
        { value: '100%', label: 'Sincronización OTAs' },
        { value: '0', label: 'Conflictos de reserva' },
        { value: '4.9★', label: 'Media de valoraciones' }
      ],
      tech: ['n8n', 'WhatsApp Business API', 'Booking API', 'Airbnb API', 'Calendar Sync', 'Supabase', 'PDF Generator', 'Google Sheets']
    },

    staysync: {
      tag: 'Hotelería',
      tagClass: 'tag-violet',
      name: 'StaySync',
      subtitle: 'Channel Manager + CRM + comunicación automatizada por WhatsApp para hoteles. Todas las OTAs sincronizadas en tiempo real.',
      bigStat: '0',
      bigLabel: 'overbookings',
      colors: { base: [139, 92, 246], accent: [168, 85, 247] },
      problem: {
        title: 'Un overbooking puede destruir 50 reseñas positivas en una noche',
        text: 'Los hoteles que gestionan disponibilidad en múltiples canales (Booking, Expedia, HotelBeds, web propia) viven con el miedo constante al overbooking. Cada minuto que un canal tarda en actualizar es un riesgo real. Y cuando ocurre, el daño reputacional es brutal: reseñas negativas, compensaciones económicas y pérdida de confianza.'
      },
      solution: {
        title: 'Sincronización en tiempo real. Cero overbookings. Cero.',
        text: 'StaySync conecta todos los canales de venta del hotel en un solo panel con sincronización bidireccional en tiempo real vía Beds24. Cuando entra una reserva en Booking, la disponibilidad se actualiza en todos los demás canales en menos de 30 segundos. Además, el CRM integrado clasifica huéspedes y los mensajes automáticos por WhatsApp mejoran la experiencia pre y post-estancia.'
      },
      steps: [
        { title: 'Conexión de canales', desc: 'Beds24 sincroniza Booking, Expedia, HotelBeds y web propia en tiempo real. Un solo panel.' },
        { title: 'Reserva → CRM automático', desc: 'Cada reserva crea un perfil de huésped con historial, preferencias y canal de origen.' },
        { title: 'WhatsApp pre-estancia', desc: 'Mensaje automático con confirmación, instrucciones de llegada y upselling personalizado.' },
        { title: 'Post-estancia y fidelización', desc: 'Encuesta de satisfacción + invitación a reserva directa con descuento exclusivo.' }
      ],
      metrics: [
        { value: '0', label: 'Overbookings' },
        { value: '<30s', label: 'Sincronización' },
        { value: '+23%', label: 'Reserva directa' },
        { value: '20→6', label: 'Emails diarios' }
      ],
      tech: ['Beds24', 'n8n', 'WhatsApp Business API', 'Supabase', 'Booking.com API', 'Expedia API', 'CRM custom', 'Webhooks']
    }
  };

  // Modal elements
  const modal = $('#project-modal');
  const pmClose = $('#pm-close');
  const pmScroll = $('#pm-scroll');
  let modalCanvasCleanup = null;

  // Populate modal content
  function openProject(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    // Fill content
    const pmTag = $('#pm-tag');
    pmTag.textContent = data.tag;
    pmTag.className = 'pm-tag ' + data.tagClass;

    $('#pm-title').textContent = data.name;
    $('#pm-subtitle').textContent = data.subtitle;
    $('#pm-big').textContent = data.bigStat;
    $('#pm-what').textContent = data.bigLabel;

    // Problem & Solution
    $('#pm-problem-title').textContent = data.problem.title;
    $('#pm-problem-text').textContent = data.problem.text;
    $('#pm-solution-title').textContent = data.solution.title;
    $('#pm-solution-text').textContent = data.solution.text;

    // Steps
    const stepsContainer = $('#pm-steps');
    stepsContainer.innerHTML = data.steps.map((s, i) => `
      <div class="pm-step-card">
        <div class="pm-step-num">${String(i + 1).padStart(2, '0')}</div>
        <div>
          <h4>${s.title}</h4>
          <p>${s.desc}</p>
        </div>
      </div>
    `).join('');

    // Metrics
    const metricsContainer = $('#pm-metrics');
    metricsContainer.innerHTML = data.metrics.map(m => `
      <div class="pm-metric">
        <span class="pm-metric-val">${m.value}</span>
        <span class="pm-metric-label">${m.label}</span>
      </div>
    `).join('');

    // Tech
    const techContainer = $('#pm-tech');
    techContainer.innerHTML = data.tech.map(t => `
      <span class="pm-tech-pill">${t}</span>
    `).join('');

    // Reset scroll
    pmScroll.scrollTop = 0;

    // Open modal
    modal.classList.add('open');
    document.body.classList.add('modal-open');

    // Init modal canvas with project colors
    setTimeout(() => {
      initParticles('#pm-canvas', {
        count: 60,
        maxDist: 140,
        speed: 0.25,
        mouseRadius: 200,
        baseColor: data.colors.base,
        accentColor: data.colors.accent,
      });
    }, 100);

    // Register hover states for new elements
    $$('.pm-step-card, .pm-metric, .pm-tech-pill, .pm-cta-btn, .pm-close', modal).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  // Event listeners
  pmClose.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.querySelector('.pm-backdrop').addEventListener('click', closeModal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Close modal when CTA link is clicked (scrolls to contact)
  const pmCtaLink = $('#pm-cta-link');
  if (pmCtaLink) {
    pmCtaLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
      setTimeout(() => {
        const contactSection = $('#contacto');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
    });
  }

  // Bind project cards
  $$('[data-project]').forEach(card => {
    const btn = card.querySelector('.project-enter');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProject(card.dataset.project);
      });
    }
    // Also allow clicking the entire card
    card.addEventListener('click', () => {
      openProject(card.dataset.project);
    });
    card.style.cursor = 'none';
  });

})();
