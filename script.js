/* ═══════════════════════════════════════════════════════
   XTech Consultant — Cinematic Interactive Engine
   Particle canvas, custom cursor, magnetic buttons,
   word-by-word reveals, and smooth animations.
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── INTEGRATIONS CONFIG ────────────────────────────
  // Webhook de n8n para recibir reservas
  const N8N_BOOKING_WEBHOOK_URL = "https://clinicnova.shop/webhook/xtech-booking";

  // Supabase — solo lectura (anon key segura en frontend)
  const SUPABASE_URL = "https://sjplrbbfmjvdnwrqmmsw.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcGxyYmJmbWp2ZG53cnFtbXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTgyOTgsImV4cCI6MjA5NTAzNDI5OH0.DQnWIta54NQj0pgQFixRxdTJ6WlEDKSwCAZp5pQR-So";

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
    const isScrolled = window.scrollY > 50;
    const hasClass = navbar.classList.contains('scrolled');
    if (isScrolled !== hasClass) {
      navbar.classList.toggle('scrolled', isScrolled);
    }
  }

  // ── SCROLL PROGRESS ────────────────────────────────
  const scrollProgress = $('#scroll-progress');

  let scrollMax = 0;

  function updateProgress() {
    const progress = scrollMax > 0 ? (window.scrollY / scrollMax) : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
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
  let cinemaItems = [];

  function setupCinemaText() {
    cinemaItems = $$('[data-reveal="words"]').map(el => {
      const text = el.textContent.trim();
      el.innerHTML = '';
      const words = text.split(/\s+/).map(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        el.appendChild(span);
        return span;
      });
      return {
        element: el,
        words: words,
        top: 0,
        height: 0
      };
    });
  }

  function cacheCinemaOffsets() {
    const scrollY = window.scrollY;
    cinemaItems.forEach(item => {
      const rect = item.element.getBoundingClientRect();
      item.top = rect.top + scrollY;
      item.height = rect.height;
    });
    scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  }

  setupCinemaText();
  cacheCinemaOffsets();

  // Re-cache on window resize and load
  window.addEventListener('resize', cacheCinemaOffsets);
  window.addEventListener('load', cacheCinemaOffsets);

  function updateCinemaText() {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    cinemaItems.forEach(item => {
      const progress = 1 - ((item.top - scrollY) / (vh * 0.7));
      const clampedProgress = Math.max(0, Math.min(1, progress));

      item.words.forEach((word, i) => {
        const wordProgress = i / item.words.length;
        const shouldBeLit = clampedProgress > wordProgress;
        const isLit = word.classList.contains('lit');
        if (shouldBeLit !== isLit) {
          word.classList.toggle('lit', shouldBeLit);
        }
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
    if (!canvas) return null;
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    // Mouse tracking relative to canvas using cached rect
    const mouseMoveHandler = (e) => {
      if (!canvasRect) updateCanvasRect();
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

    const scrollHandler = () => {
      updateCanvasRect();
    };

    canvas.parentElement.addEventListener('mousemove', mouseMoveHandler);
    canvas.parentElement.addEventListener('mouseleave', mouseLeaveHandler);
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', scrollHandler, { passive: true });

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

    observer.observe(canvas.parentElement);

    init();

    return {
      destroy: () => {
        observer.disconnect();
        cancelAnimationFrame(animationFrameId);
        if (canvas.parentElement) {
          canvas.parentElement.removeEventListener('mousemove', mouseMoveHandler);
          canvas.parentElement.removeEventListener('mouseleave', mouseLeaveHandler);
        }
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('scroll', scrollHandler);
      }
    };
  }

  // Init hero canvas (Optimized count for 60fps on Retina displays)
  initParticles('#particle-canvas', {
    count: 35,
    maxDist: 120,
    speed: 0.12,
    mouseRadius: 200,
    baseColor: [148, 163, 184],
    accentColor: [37, 99, 235],
  });

  // Init CTA canvas (Optimized count for 60fps on Retina displays)
  initParticles('#cta-canvas', {
    count: 15,
    maxDist: 90,
    speed: 0.1,
    mouseRadius: 160,
    baseColor: [148, 163, 184],
    accentColor: [37, 99, 235],
  });

  // ── SMOOTH ANCHOR SCROLL ───────────────────────────
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
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
  const ambientGlowEl = $('.ambient-glow');
  const ambientColors = {
    hero: 'rgba(255, 255, 255, 0.02)',       // Titanio sutil
    dolor: 'rgba(148, 163, 184, 0.02)',      // Pizarra Gray
    solucion: 'rgba(59, 130, 246, 0.03)',    // Cobalto Corporativo
    servicios: 'rgba(255, 255, 255, 0.01)',   // Titanio Neutro
    proyectos: 'rgba(99, 102, 241, 0.03)',   // Royal Indigo
    proceso: 'rgba(148, 163, 184, 0.01)',     // Pizarra Gray sutil
    diferenciacion: 'rgba(59, 130, 246, 0.02)',
    testimonios: 'rgba(255, 255, 255, 0.01)',
    faq: 'rgba(148, 163, 184, 0.01)',
    contacto: 'rgba(59, 130, 246, 0.03)'     // Azul de Conversión final
  };

  const ambientObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const color = ambientColors[id];
        if (color && ambientGlowEl) {
          ambientGlowEl.style.setProperty('--ambient-glow', color);
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
      colors: { base: [16, 185, 129], accent: [6, 95, 70] },
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
      colors: { base: [59, 130, 246], accent: [29, 78, 216] },
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
      colors: { base: [245, 158, 11], accent: [180, 83, 9] },
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
      colors: { base: [99, 102, 241], accent: [67, 56, 202] },
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
    if (lenis) lenis.stop();

    // Clean up previous canvas loop if any
    if (modalCanvasCleanup) {
      modalCanvasCleanup.destroy();
      modalCanvasCleanup = null;
    }

    // Init modal canvas with project colors (titanium/slate B2B theme)
    setTimeout(() => {
      if (modalCanvasCleanup) {
        modalCanvasCleanup.destroy();
      }
      modalCanvasCleanup = initParticles('#pm-canvas', {
        count: 40,
        maxDist: 130,
        speed: 0.1,
        mouseRadius: 200,
        baseColor: data.colors.base,
        accentColor: data.colors.accent,
      });
    }, 100);
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (lenis) lenis.start();
    if (modalCanvasCleanup) {
      modalCanvasCleanup.destroy();
      modalCanvasCleanup = null;
    }
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
          if (lenis) {
            lenis.scrollTo(contactSection, { offset: -80 });
          } else {
            contactSection.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
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
  });

  // ── COOKIE CONSENT BANNER LOGIC ────────────────────
  const cookieBanner = $('#cookie-banner');
  const cbAccept = $('#cb-accept');
  const cbReject = $('#cb-reject');
  const btnResetCookies = $('#btn-reset-cookies');

  if (cookieBanner) {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => {
        cookieBanner.classList.add('show');
        cookieBanner.setAttribute('aria-hidden', 'false');
      }, 1500);
    }

    if (cbAccept) {
      cbAccept.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'accepted');
        cookieBanner.classList.remove('show');
        cookieBanner.setAttribute('aria-hidden', 'true');
      });
    }

    if (cbReject) {
      cbReject.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'rejected');
        cookieBanner.classList.remove('show');
        cookieBanner.setAttribute('aria-hidden', 'true');
      });
    }
  }

  if (btnResetCookies) {
    btnResetCookies.addEventListener('click', () => {
      localStorage.removeItem('cookie_consent');
      window.location.reload();
    });
  }

  // ── LEGAL CENTER MODAL LOGIC ───────────────────────
  const legalModal = $('#legal-modal');
  const legalClose = $('#legal-close');
  const legalScroll = $('#legal-scroll');
  const legalTabBtns = $$('.legal-tab-btn');
  const legalTabContents = $$('.legal-tab-content');

  function openLegal(tabName = 'aviso') {
    if (!legalModal) return;
    legalModal.classList.add('open');
    legalModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (lenis) lenis.stop();

    // Switch to target tab
    switchLegalTab(tabName);

    if (legalScroll) {
      legalScroll.scrollTop = 0;
    }
  }

  function closeLegal() {
    if (!legalModal) return;
    legalModal.classList.remove('open');
    legalModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lenis) lenis.start();
  }

  function switchLegalTab(tabName) {
    legalTabBtns.forEach(btn => {
      const active = btn.dataset.legalTab === tabName;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    legalTabContents.forEach(content => {
      const active = content.id === `legal-${tabName}`;
      content.classList.toggle('active', active);
    });
  }

  // Bind triggers
  $$('.legal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = trigger.dataset.legal || 'aviso';
      openLegal(tabName);
    });
  });

  // Bind tabs
  legalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchLegalTab(btn.dataset.legalTab);
    });
  });

  // Bind close buttons
  if (legalClose) {
    legalClose.addEventListener('click', closeLegal);
  }

  if (legalModal) {
    const legalBackdrop = legalModal.querySelector('.pm-backdrop');
    if (legalBackdrop) {
      legalBackdrop.addEventListener('click', closeLegal);
    }
  }

  // Esc key closes legal modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal && legalModal.classList.contains('open')) {
      closeLegal();
    }
  });

  // ── B2B AUTOMATION ROI CALCULATOR ENGINE ───────────
  const sliderHours = $('#slider-hours');
  const sliderCost = $('#slider-cost');
  const valHours = $('#val-hours');
  const valCost = $('#val-cost');
  const roiAnnualSavings = $('#roi-annual-savings');
  const roiMonthlyHours = $('#roi-monthly-hours');
  const roiPayback = $('#roi-payback');

  function updateROI() {
    if (!sliderHours || !sliderCost) return;

    const hoursVal = parseInt(sliderHours.value, 10);
    const costVal = parseInt(sliderCost.value, 10);

    // Update range numeric indicator labels
    if (valHours) valHours.textContent = hoursVal;
    if (valCost) valCost.textContent = costVal;

    sliderHours.setAttribute('aria-valuenow', hoursVal);
    sliderCost.setAttribute('aria-valuenow', costVal);

    // Beautiful dynamic range track filling (fill color behind the thumb)
    const hoursPct = ((hoursVal - 5) / (80 - 5)) * 100;
    sliderHours.style.background = `linear-gradient(to right, var(--accent) ${hoursPct}%, rgba(255, 255, 255, 0.08) ${hoursPct}%)`;

    const costPct = ((costVal - 15) / (100 - 15)) * 100;
    sliderCost.style.background = `linear-gradient(to right, var(--accent) ${costPct}%, rgba(255, 255, 255, 0.08) ${costPct}%)`;

    // Calculation logic:
    // Hours saved per month = Hours * 4.33 * 0.85
    // Annual Savings = Hours * 52 * Cost * 0.85
    const annualSavings = Math.round(hoursVal * 52 * costVal * 0.85);
    const monthlyHours = Math.round(hoursVal * 4.33 * 0.85);

    let paybackText = '';
    if (annualSavings > 15000) {
      paybackText = 'Amortizado en < 1 mes';
    } else if (annualSavings > 5000) {
      paybackText = 'Amortizado en < 2 meses';
    } else {
      paybackText = 'Amortizado en < 3 meses';
    }

    // Update the displays with nice Spanish formatting
    if (roiAnnualSavings) {
      roiAnnualSavings.textContent = annualSavings.toLocaleString('es-ES');
    }
    if (roiMonthlyHours) {
      roiMonthlyHours.textContent = `${monthlyHours} h`;
    }
    if (roiPayback) {
      roiPayback.textContent = paybackText;
    }
  }

  if (sliderHours && sliderCost) {
    sliderHours.addEventListener('input', updateROI);
    sliderCost.addEventListener('input', updateROI);
    // Initial run
    updateROI();
  }

  // ── INTERACTIVE SERVICE ACCORDIONS ──────────────────
  const serviceRows = $$('.service-row');

  serviceRows.forEach(row => {
    const header = row.querySelector('.service-row-main');
    const detail = row.querySelector('.service-detail');
    if (!header || !detail) return;

    header.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');

      // Collapse all other rows
      serviceRows.forEach(r => {
        if (r !== row) {
          r.classList.remove('open');
          const d = r.querySelector('.service-detail');
          if (d) d.style.maxHeight = '0px';
        }
      });

      // Toggle current row
      if (isOpen) {
        row.classList.remove('open');
        detail.style.maxHeight = '0px';
      } else {
        row.classList.add('open');
        detail.style.maxHeight = detail.scrollHeight + 'px';
      }
    });
  });

  // Handle window resizing to adjust open accordion height dynamically
  window.addEventListener('resize', () => {
    serviceRows.forEach(row => {
      if (row.classList.contains('open')) {
        const detail = row.querySelector('.service-detail');
        if (detail) detail.style.maxHeight = detail.scrollHeight + 'px';
      }
    });
  });

  // ── B2B CALENDAR BOOKING SYSTEM ─────────────────────
  const calendarDaysGrid = $('#calendar-days-grid');
  const calendarMonthYear = $('#calendar-month-year');
  const bookingSlotsContainer = $('#booking-slots-container');
  const slotsGrid = $('#slots-grid');
  const selectedDayLabel = $('#selected-day-label');
  const btnToStep2 = $('#to-step-2');
  const btnBackToStep1 = $('#back-to-step-1');
  const btnResetBooking = $('#reset-booking-btn');
  const bookingProgressBar = $('#booking-progress-bar');
  const bookingForm = $('#booking-form');
  const successDateLabel = $('#success-date-label');

  let selectedDate = null;
  let selectedSlot = null;

  // Las horas laborables de 1h
  const workingHours = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00'
  ];

  // ── SUPABASE: Consulta de slots ocupados ────────────
  // Devuelve un array con los slots ya reservados para una fecha dada
  // Ej: ['09:00 - 10:00', '15:00 - 16:00']
  async function fetchBookedSlots(date) {
    try {
      // booking_date en Supabase contiene el ISO string del frontend (toISOString())
      // que está en UTC. Para no fallar por diferencias de timezone, buscamos
      // todos los registros y filtramos por dateFormatted O hacemos una query
      // más amplia cogiendo el día anterior y posterior en UTC.

      const year  = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day   = String(date.getDate()).padStart(2, '0');

      // Día anterior en UTC (cubre el caso de zona horaria +2: un booking a las 00:00
      // local son las 22:00 UTC del día anterior)
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevYear  = prevDate.getFullYear();
      const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
      const prevDay   = String(prevDate.getDate()).padStart(2, '0');

      // Rango amplio: desde las 22:00 UTC del día anterior hasta las 22:00 UTC del día actual
      // Esto cubre horas 00:00-23:59 en España (UTC+2) con margen seguro
      const rangeStart = `${prevYear}-${prevMonth}-${prevDay}T22:00:00.000Z`;
      const rangeEnd   = `${year}-${month}-${day}T22:00:00.000Z`;

      const url = `${SUPABASE_URL}/rest/v1/xtech_booked_slots` +
        `?select=booking_slot,booking_date` +
        `&booking_date=gte.${encodeURIComponent(rangeStart)}` +
        `&booking_date=lt.${encodeURIComponent(rangeEnd)}` +
        `&order=booking_date.asc`;

      console.log('[XTech Booking] Consultando Supabase para:', `${year}-${month}-${day}`);
      console.log('[XTech Booking] URL query:', url);

      const res = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[XTech Booking] HTTP status:', res.status);

      if (!res.ok) {
        const errBody = await res.text();
        console.error('[XTech Booking] Error Supabase:', res.status, errBody);
        // Si es 401 = RLS bloqueando. Si es 400 = nombre de columna mal.
        if (res.status === 401 || res.status === 403) {
          console.error('[XTech Booking] ⚠️ RLS bloqueando lectura anon. Ve a Supabase → Authentication → Policies y añade una política SELECT para anon en xtech_leads.');
        }
        return [];
      }

      const rows = await res.json();
      console.log('[XTech Booking] Filas encontradas:', rows.length, rows);

      const slots = rows.map(r => r.booking_slot).filter(Boolean);
      console.log('[XTech Booking] Slots ocupados:', slots);
      return slots;

    } catch (err) {
      console.error('[XTech Booking] Error de red consultando Supabase:', err);
      return []; // Fallback seguro: no bloquear nada
    }
  }

  // Nombres de meses en español
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  function initBookingSystem() {
    if (!calendarDaysGrid) return;
    renderCalendar();

    // Acciones de Pasos
    btnToStep2.addEventListener('click', () => changeStep(2));
    btnBackToStep1.addEventListener('click', () => changeStep(1));
    if (btnResetBooking) {
      btnResetBooking.addEventListener('click', () => {
        // Reset state
        selectedDate = null;
        selectedSlot = null;
        bookingForm.reset();
        renderCalendar();
        bookingSlotsContainer.style.display = 'none';
        btnToStep2.classList.add('disabled');
        btnToStep2.setAttribute('disabled', 'true');
        changeStep(1);
      });
    }

    // Form Submit
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  function renderCalendar() {
    const today = new Date();
    calendarDaysGrid.innerHTML = '';

    // Mostrar mes actual / siguiente
    calendarMonthYear.textContent = `${monthNames[today.getMonth()]} / ${monthNames[(today.getMonth() + 1) % 12]} ${today.getFullYear()}`;

    // Obtener los próximos 14 días naturales para filtrar 10 días laborables válidos
    let dayCounter = 0;
    let checkDate = new Date(today);
    // Empezar mañana para evitar reservas en el mismo día
    checkDate.setDate(checkDate.getDate() + 1);

    // Generar la rejilla de días
    const daysToRender = [];

    while (dayCounter < 12) {
      const dayOfWeek = checkDate.getDay();
      // Bloquear fines de semana (0 = Domingo, 6 = Sábado)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysToRender.push(new Date(checkDate));
        dayCounter++;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    // Renderizar botones redondos con el número y el nombre abreviado del día
    daysToRender.forEach(date => {
      const dayDiv = document.createElement('button');
      dayDiv.type = "button";
      dayDiv.className = 'calendar-day';

      const dayNum = date.getDate();
      dayDiv.textContent = dayNum;
      dayDiv.title = `${dayNames[date.getDay()]} ${dayNum} de ${monthNames[date.getMonth()]}`;

      // Si es el seleccionado
      if (selectedDate && isSameDay(date, selectedDate)) {
        dayDiv.classList.add('selected');
      }

      dayDiv.addEventListener('click', () => {
        // Deseleccionar anteriores
        $$('.calendar-day', calendarDaysGrid).forEach(el => el.classList.remove('selected'));
        dayDiv.classList.add('selected');

        selectedDate = date;
        selectedSlot = null; // reset slot al cambiar día

        // Deshabilitar botón continuar
        btnToStep2.classList.add('disabled');
        btnToStep2.setAttribute('disabled', 'true');

        // Mostrar slots
        showSlotsForDate(date);
      });

      calendarDaysGrid.appendChild(dayDiv);
    });
  }

  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  async function showSlotsForDate(date) {
    const formattedDate = `${dayNames[date.getDay()]} ${date.getDate()} de ${monthNames[date.getMonth()]}`;
    selectedDayLabel.textContent = formattedDate;

    // Mostrar skeleton loader mientras consulta Supabase
    slotsGrid.innerHTML = workingHours.map(() =>
      `<div class="slot-skeleton"></div>`
    ).join('');
    bookingSlotsContainer.style.display = 'block';

    // Consultar slots ocupados en Supabase
    const bookedSlots = await fetchBookedSlots(date);

    // Renderizar slots con estado real
    slotsGrid.innerHTML = '';

    workingHours.forEach(hour => {
      const isBooked = bookedSlots.includes(hour);
      const slotBtn = document.createElement('button');
      slotBtn.type = "button";
      slotBtn.className = isBooked ? 'slot-btn slot-booked' : 'slot-btn';
      slotBtn.textContent = isBooked ? `${hour} — Ocupado` : hour;
      slotBtn.disabled = isBooked;
      slotBtn.setAttribute('aria-disabled', isBooked ? 'true' : 'false');
      slotBtn.title = isBooked ? 'Esta franja ya está reservada' : `Reservar ${hour}`;

      if (!isBooked && selectedSlot === hour) {
        slotBtn.classList.add('selected');
      }

      if (!isBooked) {
        slotBtn.addEventListener('click', () => {
          $$('.slot-btn', slotsGrid).forEach(el => el.classList.remove('selected'));
          slotBtn.classList.add('selected');

          selectedSlot = hour;

          // Habilitar botón de continuar
          btnToStep2.classList.remove('disabled');
          btnToStep2.removeAttribute('disabled');
        });
      }

      slotsGrid.appendChild(slotBtn);
    });

    // Scroll suave hacia los slots si es móvil
    if (window.innerWidth < 768) {
      bookingSlotsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function changeStep(stepNum) {
    // Esconder todos los pasos
    $$('.booking-step').forEach(el => el.classList.remove('active'));

    // Activar paso
    $(`#step-${stepNum}`).classList.add('active');

    // Actualizar barra de progreso
    if (stepNum === 1) {
      bookingProgressBar.style.width = '33%';
    } else if (stepNum === 2) {
      bookingProgressBar.style.width = '66%';
    } else if (stepNum === 3) {
      bookingProgressBar.style.width = '100%';
    }

    // Scroll suave arriba de la tarjeta
    $('.booking-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();

    const submitBtn = $('#submit-booking-btn');
    const originalText = submitBtn.innerHTML;

    // Cambiar estado a cargando
    submitBtn.classList.add('disabled');
    submitBtn.setAttribute('disabled', 'true');
    submitBtn.innerHTML = `<span>Procesando...</span>`;

    // Datos del formulario
    const name = $('#b-name').value;
    const email = $('#b-email').value;
    const company = $('#b-company').value;
    const revenue = $('#b-revenue').value;
    const bottleneck = $('#b-bottleneck').value;

    const formattedDate = `${dayNames[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]} de ${selectedDate.getFullYear()}`;

    const payload = {
      date: selectedDate.toISOString(),
      dateFormatted: formattedDate,
      slot: selectedSlot,
      name: name,
      email: email,
      company: company,
      revenue: revenue,
      bottleneck: bottleneck,
      submittedAt: new Date().toISOString()
    };

    // Guardar copia local de contingencia
    const localBookings = JSON.parse(localStorage.getItem('xtech_bookings') || '[]');
    localBookings.push(payload);
    localStorage.setItem('xtech_bookings', JSON.stringify(localBookings));

    // Intentar disparar webhook si está configurado
    if (N8N_BOOKING_WEBHOOK_URL) {
      try {
        const response = await fetch(N8N_BOOKING_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          console.warn('Respuesta de webhook no exitosa:', response.status);
        }
      } catch (err) {
        console.error('Error al enviar webhook de n8n:', err);
      }
    }

    // Actualizar pantalla de éxito
    successDateLabel.textContent = `${formattedDate} a las ${selectedSlot.split(' - ')[0]}`;

    // Transicionar al paso 3
    changeStep(3);

    // Restablecer botón
    submitBtn.classList.remove('disabled');
    submitBtn.removeAttribute('disabled');
    submitBtn.innerHTML = originalText;
  }

  const sectorDemoData = {
    clinica: {
      steps: [
        { title: 'Software Clínico & Agenda a medida', desc: 'Fichas clínicas encriptadas y agenda de especialistas multidispositivo.' },
        { title: 'Confirmación Activa por WhatsApp',    desc: 'Recordatorios integrados que permiten confirmar o reagendar en un clic.' },
        { title: 'Lista de Espera Inteligente',        desc: 'La IA detecta cancelaciones y reasigna los huecos libres en 12 segundos.' },
        { title: 'Conciliación y Cobros con Stripe',    desc: 'Facturación automática post-consulta sin pasar por recepción.' }
      ],
      result: { metric: '-61%', label: 'ausencias · Agenda médica centralizada, ágil y 100% segura' }
    },
    contabilidad: {
      steps: [
        { title: 'Conciliación Bancaria & Cobros',    desc: 'Entrada unificada de facturas recibidas por email, WhatsApp o ERP.' },
        { title: 'Extracción Contable con IA',          desc: 'GPT-4 Vision procesa bases imponibles, IVA e IRPF sin errores humanos.' },
        { title: 'Sincronización con Holded / A3',     desc: 'Exportación directa de asientos contables estructurados en tiempo real.' },
        { title: 'Dashboard de Control Financiero',     desc: 'Previsión de caja, IVA acumulado y analítica financiera a un clic.' }
      ],
      result: { metric: '4.2s', label: 'por factura · Detección inmediata de anomalías y cuadre fiscal 100%' }
    },
    turismo: {
      steps: [
        { title: 'Channel Manager Multiproveedor',      desc: 'Sincronización en tiempo real vía Beds24 de Booking, Airbnb y web propia.' },
        { title: 'Conserjería Virtual & Accesos',       desc: 'Check-in móvil automatizado y entrega digital de llaves de acceso.' },
        { title: 'Ficha Policial en Tiempo Real',       desc: 'Envío seguro y automatizado de datos de viajeros a las autoridades.' },
        { title: 'Algoritmo de Precios Dinámicos',      desc: 'Optimización automatizada de tarifas según ocupación y mercado.' }
      ],
      result: { metric: '0', label: 'overbookings · Ahorro de 30h/semana en gestión y +23% reservas directas' }
    },
    empresa: {
      steps: [
        { title: 'Diagnóstico & Auditoría de Core',     desc: 'Mapeamos tus ineficiencias de datos, financieras u operativas.' },
        { title: 'Diseño de Arquitectura y UX/UI',      desc: 'Creamos prototipos de software personalizados a tus flujos.' },
        { title: 'Desarrollo de Software Propietario',   desc: 'Programamos tu SaaS, CRM, ERP o portal a medida en sprints quincenales.' },
        { title: 'Despliegue Cloud & Soporte CTO',       desc: 'Lanzamos el sistema a producción y actuamos como tu equipo de ingeniería.' }
      ],
      result: { metric: '100%', label: 'Personalizado · Construimos software propietario para cualquier reto empresarial' }
    }
  };

  function initSectorDemo() {
    const sdFlow   = document.getElementById('sd-flow');
    const sdResult = document.getElementById('sd-result');
    const tabs     = document.querySelectorAll('.sd-tab');
    if (!sdFlow || !tabs.length) return;

    const sectorOrder = ['clinica', 'contabilidad', 'turismo', 'empresa'];
    let currentSector  = 'clinica';
    let autoRotateTimer = null;

    function renderSector(sectorKey, fade = true) {
      const data = sectorDemoData[sectorKey];
      if (!data) return;
      currentSector = sectorKey;

      // Update tabs
      tabs.forEach(tab => {
        const isActive = tab.dataset.sector === sectorKey;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        // Restart the progress bar animation by forcing a reflow
        if (isActive) {
          tab.classList.remove('active');
          void tab.offsetWidth; // force reflow
          tab.classList.add('active');
        }
      });

      // Fade out
      if (fade) {
        sdFlow.style.opacity = '0';
        sdFlow.style.transform = 'translateY(5px)';
        sdResult.classList.remove('visible');
      }

      const delay = fade ? 220 : 0;

      setTimeout(() => {
        // Render steps
        sdFlow.innerHTML = data.steps.map((step, i) => `
          <div class="sd-step" style="animation-delay: ${i * 0.13}s">
            <div class="sd-step-num">${String(i + 1).padStart(2, '0')}</div>
            <div class="sd-step-content">
              <div class="sd-step-title">${step.title}</div>
              <div class="sd-step-desc">${step.desc}</div>
            </div>
          </div>
        `).join('');

        // Render result
        sdResult.innerHTML = `
          <span class="sd-result-icon">✓</span>
          <span class="sd-result-metric">${data.result.metric}</span>
          <span class="sd-result-label">${data.result.label}</span>
        `;

        // Fade in
        sdFlow.style.opacity = '1';
        sdFlow.style.transform = 'translateY(0)';

        // Show result after steps animate
        const resultDelay = data.steps.length * 130 + 200;
        setTimeout(() => sdResult.classList.add('visible'), resultDelay);

      }, delay);
    }

    function startAutoRotate() {
      clearInterval(autoRotateTimer);
      autoRotateTimer = setInterval(() => {
        const idx  = sectorOrder.indexOf(currentSector);
        const next = sectorOrder[(idx + 1) % sectorOrder.length];
        renderSector(next, true);
      }, 5000);
    }

    // Tab click — manual override resets timer
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const sector = tab.dataset.sector;
        if (sector === currentSector) return;
        renderSector(sector, true);
        startAutoRotate(); // reset countdown
      });
    });

    // Initial render + start rotation
    renderSector('clinica', false);
    startAutoRotate();
  }

  // Inicializar todo
  initSectorDemo();
  initBookingSystem();


})();
