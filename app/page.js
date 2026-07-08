'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ParticleCanvas from '../components/ParticleCanvas';
import InteractiveSimulator from '../components/InteractiveSimulator';
import BookingCalendar from '../components/BookingCalendar';

// Datos de los Proyectos para el Modal Inmersivo
const projectData = {
  clinicnova: {
    tag: 'Salud',
    tagClass: 'tag-emerald',
    name: 'ClinicNova',
    subtitle: 'Gestión integral de clínicas con recordatorios inteligentes por WhatsApp, citas online y cobros automatizados con Stripe.',
    bigStat: '-61%',
    bigLabel: 'ausencias de pacientes',
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
    tech: ['Pipeline', 'WhatsApp Enterprise API', 'Stripe (PCI-DSS)', 'Supabase Enterprise', 'Next.js', 'PostgreSQL', 'APIs en Tiempo Real', 'Motores de Programación (Cron)']
  },

  kontai: {
    tag: 'Contabilidad',
    tagClass: 'tag-cyan',
    name: 'KontAI',
    subtitle: 'OCR con inteligencia artificial que lee facturas, extrae datos contables, calcula impuestos y exporta a tu gestoría en segundos.',
    bigStat: '4.2s',
    bigLabel: 'por factura procesada',
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
    tech: ['IA Cognitiva (Vision)', 'Procesamiento IDP', 'Pipeline', 'Holded API', 'Supabase Enterprise', 'WhatsApp Enterprise API', 'Gmail API', 'PDF Parser']
  },

  '4stancias': {
    tag: 'Turismo',
    tagClass: 'tag-amber',
    name: '4Stancias',
    subtitle: 'Automatización total de gestión de apartamentos turísticos. Reservas, check-in digital, mensajes automáticos y coordinación de limpieza.',
    bigStat: '30min',
    bigLabel: 'de gestión por semana',
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
    tech: ['Pipeline', 'WhatsApp Enterprise API', 'Booking API', 'Airbnb API', 'Sincronización Multicanal', 'Supabase Enterprise', 'Generación de Informes PDF', 'Google Workspace API']
  },

  staysync: {
    tag: 'Hotelería',
    tagClass: 'tag-violet',
    name: 'StaySync',
    subtitle: 'Channel Manager + CRM + comunicación automatizada por WhatsApp para hoteles. Todas las OTAs sincronizadas en tiempo real.',
    bigStat: '0',
    bigLabel: 'overbookings',
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
    tech: ['Beds24 Sync', 'Pipeline', 'WhatsApp Enterprise API', 'Supabase Enterprise', 'Booking.com Enterprise API', 'Expedia API', 'CRM Propietario', 'APIs en Tiempo Real']
  }
};

const sectorDemoData = {
  clinica: {
    steps: [
      { title: 'Software Clínico & Agenda a medida', desc: 'Fichas clínicas encriptadas y agenda de especialistas multidispositivo.' },
      { title: 'Confirmación Activa por WhatsApp', desc: 'Recordatorios integrados que permiten confirmar o reagendar en un clic.' },
      { title: 'Lista de Espera Inteligente', desc: 'La IA detecta cancelaciones y reasigna los huecos libres en 12 segundos.' },
      { title: 'Conciliación y Cobros con Stripe', desc: 'Facturación automática post-consulta sin pasar por recepción.' }
    ],
    result: { metric: '61%', label: 'menos ausencias · Ahorro de 4h/día y facturación +15% de media' }
  },
  contabilidad: {
    steps: [
      { title: 'Detección en Bandeja de Entrada', desc: 'Lectura automática de emails buscando facturas PDF adjuntas.' },
      { title: 'Extracción Cognitiva con IA', desc: 'Lectura OCR del emisor, NIF/CIF, importes, IVA, IRPF y fecha.' },
      { title: 'Validación y Clasificación', desc: 'Cruza con base de datos propia para evitar duplicados y clasificar gasto.' },
      { title: 'Inyección en ERP / Gestoría', desc: 'Registro automático en Holded o A3 en menos de 5 segundos sin errores.' }
    ],
    result: { metric: '4.2s', label: 'por factura · Detección inmediata de anomalías y cuadre fiscal 100%' }
  },
  turismo: {
    steps: [
      { title: 'Channel Manager Multiproveedor', desc: 'Sincronización en tiempo real vía Beds24 de Booking, Airbnb y web propia.' },
      { title: 'Conserjería Virtual & Accesos', desc: 'Check-in móvil automatizado y entrega digital de llaves de acceso.' },
      { title: 'Ficha Policial en Tiempo Real', desc: 'Envío seguro y automatizado de datos de viajeros a las autoridades.' },
      { title: 'Algoritmo de Precios Dinámicos', desc: 'Optimización automatizada de tarifas según ocupación y mercado.' }
    ],
    result: { metric: '0', label: 'overbookings · Ahorro de 30h/semana en gestión y +23% reservas directas' }
  },
  empresa: {
    steps: [
      { title: 'Inmersión en tu Negocio', desc: 'Nos integramos en tus operaciones para entender tus cuellos de botella reales desde dentro.' },
      { title: 'Diseño de la Ruta Digital', desc: 'Trazamos un plan estratégico a medida combinando software, IA y automatización.' },
      { title: 'Co-Construcción Activa', desc: 'Programamos y desplegamos tu sistema propietario paso a paso, de forma ágil.' },
      { title: 'Acompañamiento Permanente', desc: 'No desaparecemos: evolucionamos tu tecnología para asegurar tu crecimiento continuo.' }
    ],
    result: { metric: '100%', label: 'Implicación · No somos un proveedor frío, somos tu socio tecnológico estratégico' }
  }
};

const CinemaText = ({ text, className = "" }) => {
  const words = React.useMemo(() => text.split(/\s+/), [text]);
  const elRef = React.useRef(null);

  React.useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const updateCinemaScroll = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const rect = el.getBoundingClientRect();
      const top = rect.top + scrollY;

      // El progreso del scroll en relación a la pantalla (se ilumina al llegar al 75% del viewport)
      const progress = 1 - (top - scrollY) / (vh * 0.75);
      const clamped = Math.max(0, Math.min(1, progress));

      const wordSpans = el.querySelectorAll('.word');
      wordSpans.forEach((word, i) => {
        const wordProgress = i / wordSpans.length;
        const shouldBeLit = clamped > wordProgress;
        word.classList.toggle('lit', shouldBeLit);
      });
    };

    window.addEventListener('scroll', updateCinemaScroll, { passive: true });
    window.addEventListener('resize', updateCinemaScroll);
    updateCinemaScroll();

    return () => {
      window.removeEventListener('scroll', updateCinemaScroll);
      window.removeEventListener('resize', updateCinemaScroll);
    };
  }, [words]);

  return (
    <p ref={elRef} className={`cinema-text ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="word">
          {word}{" "}
        </span>
      ))}
    </p>
  );
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [activeLegalTab, setActiveLegalTab] = useState(null); // 'aviso' | 'privacidad' | 'cookies' | null
  const [showCookies, setShowCookies] = useState(false);
  
  // Demo en vivo cabecera
  const [activeSectorDemo, setActiveSectorDemo] = useState('clinica');
  const [sectorDemoFade, setSectorDemoFade] = useState(false);
  const sectorDemoTimer = useRef(null);

  // Calculadora de ROI
  const [roiHours, setRoiHours] = useState(20);
  const [roiCost, setRoiCost] = useState(25);

  // Pilares de servicios
  const [activeService, setActiveService] = useState(null);

  // FAQ
  const [activeFaq, setActiveFaq] = useState(null);

  // Animación del banner de cookies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        setShowCookies(true);
      }
    }
  }, []);

  const handleCookieConsent = (accept) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookie_consent', accept ? 'accepted' : 'rejected');
      setShowCookies(false);
    }
  };

  // Rotación automática de Demo Cabecera
  const startSectorDemoRotation = () => {
    clearInterval(sectorDemoTimer.current);
    sectorDemoTimer.current = setInterval(() => {
      const keys = Object.keys(sectorDemoData);
      setActiveSectorDemo((current) => {
        const nextIdx = (keys.indexOf(current) + 1) % keys.length;
        setSectorDemoFade(true);
        setTimeout(() => setSectorDemoFade(false), 220);
        return keys[nextIdx];
      });
    }, 5000);
  };

  useEffect(() => {
    startSectorDemoRotation();
    return () => clearInterval(sectorDemoTimer.current);
  }, []);

  const selectSectorDemo = (key) => {
    if (key === activeSectorDemo) return;
    setSectorDemoFade(true);
    setTimeout(() => {
      setActiveSectorDemo(key);
      setSectorDemoFade(false);
    }, 220);
    startSectorDemoRotation(); // Reset timer
  };

  // ── MASTER CLIENT-SIDE EFFECT (Scroll Reveals, Cinema Text, Magnetic Buttons, Scroll Progress) ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Scroll reveal (.reveal-up -> .visible)
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal-up').forEach((el) => revealObserver.observe(el));

    // 2. Scroll progress bar
    const progressFill = document.getElementById('scroll-progress');
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollMax > 0 ? scrollY / scrollMax : 0;
      if (progressFill) {
        progressFill.style.transform = `scaleX(${pct})`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. Magnetic buttons
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    const mouseHandlers = Array.from(magneticBtns).map((btn) => {
      const onMouseMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      };

      const onMouseLeave = () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => {
          btn.style.transition = '';
        }, 500);
      };

      btn.addEventListener('mousemove', onMouseMove);
      btn.addEventListener('mouseleave', onMouseLeave);

      return { btn, onMouseMove, onMouseLeave };
    });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      mouseHandlers.forEach(({ btn, onMouseMove, onMouseLeave }) => {
        btn.removeEventListener('mousemove', onMouseMove);
        btn.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  // Cálculos ROI
  const savings = useMemo(() => {
    const annual = Math.round(roiHours * 52 * roiCost * 0.85);
    const monthlyHours = Math.round(roiHours * 4.33 * 0.85);
    let paybackText = '';
    if (annual > 15000) paybackText = 'Amortizado en < 1 mes';
    else if (annual > 5000) paybackText = 'Amortizado en < 2 meses';
    else paybackText = 'Amortizado en < 3 meses';

    return {
      annual: annual.toLocaleString('es-ES'),
      monthlyHours,
      paybackText,
    };
  }, [roiHours, roiCost]);

  // Cerrar modal con escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveProject(null);
        setActiveLegalTab(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main id="main-content" role="main">
      {/* NAVBAR */}
      <nav id="navbar" className="scrolled" role="navigation" aria-label="Navegación principal">
        <div className="nav-inner">
          <a href="#" className="nav-logo" id="nav-logo" aria-label="XTech Consultant Inicio">
            <svg className="logo-svg" viewBox="0 0 100 100" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>
              </defs>
              <path d="M 20,20 L 40,50 L 20,80" stroke="url(#logoGrad)" strokeWidth="12" />
              <path d="M 80,20 L 60,50 L 80,80" stroke="url(#logoGrad)" strokeWidth="12" />
              <path d="M 40,50 L 50,65 M 60,50 L 50,35" stroke="url(#logoGrad)" strokeWidth="12" />
              <path d="M 15,15 L 35,15 L 45,30 L 55,15 L 75,15 L 53,47 L 75,75 L 55,75 L 45,60 L 35,75 L 15,75 L 37,43 Z" stroke="url(#logoGrad)" strokeWidth="6" opacity="0.85" />
            </svg>
            <span className="logo-text">X<span className="text-gradient">Tech</span></span>
          </a>
          <ul className="nav-links" id="nav-links">
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#simulador">Simulador</a></li>
            <li><a href="#proyectos">Proyectos</a></li>
            <li><a href="#proceso">Proceso</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <a href="#contacto" className="nav-cta magnetic-btn" id="nav-cta">
            <span>Hablar con un experto</span>
          </a>
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-label="Abrir menú" 
            aria-expanded={isMobileMenuOpen}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} id="mobile-menu">
          <ul>
            <li><a href="#servicios" onClick={() => setIsMobileMenuOpen(false)}>Servicios</a></li>
            <li><a href="#simulador" onClick={() => setIsMobileMenuOpen(false)}>Simulador</a></li>
            <li><a href="#proyectos" onClick={() => setIsMobileMenuOpen(false)}>Proyectos</a></li>
            <li><a href="#proceso" onClick={() => setIsMobileMenuOpen(false)}>Proceso</a></li>
            <li><a href="#faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a></li>
            <li><a href="#contacto" className="mobile-cta" onClick={() => setIsMobileMenuOpen(false)}>Hablar con un experto</a></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <ParticleCanvas
          id="particle-canvas"
          count={35}
          maxDist={120}
          speed={0.12}
          mouseRadius={200}
          baseColor={[148, 163, 184]}
          accentColor={[37, 99, 235]}
          className="particle-canvas"
        />
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="hero-vignette" aria-hidden="true"></div>
        <div className="hero-light-ray" aria-hidden="true"></div>

        <div className="container hero-container">
          <div className="hero-centered-layout">
            <div className="hero-text-block">
              <h1 className="hero-eyebrow reveal-up visible">
                <span className="eyebrow-dot"></span>
                Consultoría Tecnológica & Automatización IA para PYMEs
              </h1>

              <h2 className="hero-title">
                <span className="title-line reveal-up visible" style={{ '--d': '0.15s' }}>
                  <span className="title-word">Nos </span>
                  <span className="title-word">implicamos </span>
                  <span className="title-word">en </span>
                  <span className="title-word">el</span>
                </span>
                <span className="title-line reveal-up visible" style={{ '--d': '0.3s' }}>
                  <span className="title-word">corazón </span>
                  <span className="title-word">de </span>
                  <span className="title-word">tu </span>
                  <span className="title-word">negocio</span>
                </span>
                <span className="title-line title-gradient reveal-up visible" style={{ '--d': '0.45s' }}>
                  <span className="title-word">para </span>
                  <span className="title-word">hacerlo </span>
                  <span className="title-word">crecer.</span>
                </span>
              </h2>

              <p className="hero-sub reveal-up visible" style={{ '--d': '0.65s' }}>
                Somos XTech: un equipo ágil y apasionado de talento nativo digital. No somos simples proveedores de software externos; nos convertimos en tu socio tecnológico estratégico, guiándote paso a paso en la modernización, eficiencia y transformación digital de tu PYME.
              </p>

              <div className="hero-actions reveal-up visible" style={{ '--d': '0.8s' }}>
                <a href="#contacto" className="btn-primary magnetic-btn" id="hero-cta">
                  <span>Iniciar Diagnóstico Digital</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                </a>
                <a href="#proceso" className="btn-ghost magnetic-btn" id="hero-secondary">
                  <span>Ver Nuestro Método</span>
                </a>
              </div>
            </div>

            {/* DEMO EN VIVO CABECERA */}
            <div className="hero-widget-block reveal-up visible" style={{ '--d': '0.9s' }}>
              <div className="sector-demo" id="sector-demo">
                <div className="sd-header">
                  <div className="sd-status">
                    <span className="sd-pulse-dot"></span>
                    <span>DEMO EN VIVO</span>
                  </div>
                  <div className="sd-hint">Selecciona una pestaña para ver el flujo</div>
                </div>

                <div className="sd-tabs" role="tablist" aria-label="Selecciona tu sector">
                  <button className={`sd-tab ${activeSectorDemo === 'clinica' ? 'active' : ''}`} onClick={() => selectSectorDemo('clinica')} role="tab" aria-selected={activeSectorDemo === 'clinica'}>
                    <svg className="sd-tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    <span>Salud</span>
                  </button>
                  <button className={`sd-tab ${activeSectorDemo === 'contabilidad' ? 'active' : ''}`} onClick={() => selectSectorDemo('contabilidad')} role="tab" aria-selected={activeSectorDemo === 'contabilidad'}>
                    <svg className="sd-tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                    <span>Finanzas</span>
                  </button>
                  <button className={`sd-tab ${activeSectorDemo === 'turismo' ? 'active' : ''}`} onClick={() => selectSectorDemo('turismo')} role="tab" aria-selected={activeSectorDemo === 'turismo'}>
                    <svg className="sd-tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    <span>Turismo</span>
                  </button>
                  <button className={`sd-tab ${activeSectorDemo === 'empresa' ? 'active' : ''}`} onClick={() => selectSectorDemo('empresa')} role="tab" aria-selected={activeSectorDemo === 'empresa'}>
                    <svg className="sd-tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                    <span>Nuestro Método</span>
                  </button>
                </div>

                <div className="sd-flow" style={{ opacity: sectorDemoFade ? '0' : '1', transform: sectorDemoFade ? 'translateY(5px)' : 'translateY(0)', transition: 'opacity 0.2s, transform 0.2s' }}>
                  {sectorDemoData[activeSectorDemo]?.steps.map((step, idx) => (
                    <div className="sd-step" key={idx} style={{ animationDelay: `${idx * 0.13}s` }}>
                      <div className="sd-step-num">{String(idx + 1).padStart(2, '0')}</div>
                      <div className="sd-step-content">
                        <div className="sd-step-title">{step.title}</div>
                        <div className="sd-step-desc">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`sd-result ${!sectorDemoFade ? 'visible' : ''}`}>
                  <span className="sd-result-icon">✓</span>
                  <span className="sd-result-metric">{sectorDemoData[activeSectorDemo]?.result.metric}</span>
                  <span className="sd-result-label">{sectorDemoData[activeSectorDemo]?.result.label}</span>
                </div>

                <div className="sd-footer">
                  + Retail · Logística · Legal · Inmobiliario · y cualquier otro sector
                </div>
              </div>
            </div>

            {/* proof block */}
            <div className="hero-proof-block reveal-up visible" style={{ '--d': '1.15s' }}>
              <div className="hero-proof">
                <div className="proof-item">
                  <span className="proof-number">61</span><span className="proof-suffix">%</span>
                  <span className="proof-label">menos ausencias en clínicas</span>
                  <div className="stat-bar" aria-hidden="true"><div className="stat-bar-fill" style={{ '--w': '61%' }}></div></div>
                </div>
                <div className="proof-sep"></div>
                <div className="proof-item">
                  <span className="proof-number">4.2</span><span className="proof-suffix">s</span>
                  <span className="proof-label">por factura procesada con IA</span>
                  <div className="stat-bar" aria-hidden="true"><div class="stat-bar-fill" style={{ '--w': '92%' }}></div></div>
                </div>
                <div className="proof-sep"></div>
                <div className="proof-item">
                  <span className="proof-number">0</span>
                  <span className="proof-label">overbookings en hoteles</span>
                  <div className="stat-bar" aria-hidden="true"><div className="stat-bar-fill" style={{ '--w': '100%' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* INTERSTITIAL 1 */}
      <section className="interstitial">
        <div className="container">
          <CinemaText text="Tu competencia ya automatizó lo que tú haces a mano. Cada semana que pasa, la brecha se hace más grande. Y no se cierra sola." />
        </div>
      </section>

      {/* PAIN */}
      <section id="dolor" className="section">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">El problema real</div>
          <h2 class="section-title reveal-up visible">
            Esto pasa en tu empresa<br />
            <span className="text-muted">todos los días.</span>
          </h2>

          <div className="pain-stack">
            <div className="pain-row reveal-up visible">
              <div className="pain-num">01</div>
              <div className="pain-body">
                <h3>Tu equipo repite las mismas 47 tareas cada semana</h3>
                <p>Copiar datos de un excel a otro. Enviar el mismo email 30 veces. Revisar facturas una a una. Tu gente no trabaja — sobrevive.</p>
              </div>
              <div className="pain-stat">
                <span className="pain-big">80</span><span className="pain-unit">%</span>
                <span className="pain-caption">del tiempo en tareas manuales</span>
                <div className="stat-bar pain-bar" aria-hidden="true"><div className="stat-bar-fill" style={{ '--w': '80%' }}></div></div>
              </div>
            </div>

            <div className="pain-row reveal-up visible">
              <div className="pain-num">02</div>
              <div className="pain-body">
                <h3>Tus datos están en 5 sitios distintos y nadie tiene la foto completa</h3>
                <p>El CRM dice una cosa, el Excel otra, el email otra. Tomas decisiones a ciegas porque tu información está desperdigada en herramientas que no se hablan.</p>
              </div>
              <div className="pain-stat">
                <span className="pain-big">5</span><span className="pain-unit">+</span>
                <span className="pain-caption">herramientas sin conectar</span>
                <div className="visual-node-net" aria-hidden="true">
                  <span className="node active"></span><span className="line disconnected"></span>
                  <span className="node active"></span><span className="line disconnected"></span>
                  <span className="node active"></span><span className="line disconnected"></span>
                  <span className="node active"></span><span className="line disconnected"></span>
                  <span className="node warning"></span>
                </div>
              </div>
            </div>

            <div className="pain-row reveal-up visible">
              <div className="pain-num">03</div>
              <div className="pain-body">
                <h3>Pierdes clientes porque llegas tarde</h3>
                <p>Un lead pregunta a las 11:00. Le contestas a las 17:00. Para entonces ya contrató a otro. El mercado premia la velocidad, y tú estás jugando al pasado.</p>
              </div>
              <div className="pain-stat">
                <span className="pain-big">3x</span>
                <span className="pain-caption">más lento que tu competencia</span>
                <div className="visual-scale" aria-hidden="true">
                  <div className="scale-lane competitor" style={{ width: '30%' }}></div>
                  <div className="scale-lane ours" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERSTITIAL 2 */}
      <section className="interstitial">
        <div className="container">
          <CinemaText text="No necesitas más herramientas. Necesitas que alguien conecte las que ya tienes, automatice lo que te roba tiempo, y construya lo que no existe en el mercado." />
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solucion" className="section">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">Lo que hacemos</div>
          <h2 className="section-title reveal-up visible">
            Especialistas en resolver problemas complejos<br />
            <span className="text-gradient">de negocio con tecnología.</span>
          </h2>
          <p className="section-desc reveal-up visible">No somos una agencia más. Nos sentamos contigo a analizar los cuellos de botella clínicos, ineficiencias contables o lagunas de gestión de tu empresa. Diseñamos la arquitectura óptima y construimos software y sistemas propietarios que realmente mueven tu facturación. Somos tu CTO externo de confianza.</p>

          <div className="solution-grid">
            <div className="sol-card reveal-up visible">
              <div className="sol-icon sol-icon-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              </div>
              <h3>Analizamos</h3>
              <p className="sol-meta">30 min · Gratis · Sin compromiso</p>
              <p>Videollamada de 30 minutos. Nos cuentas qué te quita tiempo. Te decimos exactamente qué se puede automatizar y cuánto vas a ahorrar. Sin humo.</p>
            </div>
            <div className="sol-card reveal-up visible">
              <div className="sol-icon sol-icon-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              </div>
              <h3>Diseñamos</h3>
              <p className="sol-meta">1 semana · Presupuesto cerrado</p>
              <p>Arquitectura técnica a medida. Sabes qué se va a construir, cuánto cuesta y cuándo lo tienes. Sin sorpresas. Sin el clásico "esto no estaba incluido".</p>
            </div>
            <div className="sol-card reveal-up visible">
              <div className="sol-icon sol-icon-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
              </div>
              <h3>Construimos</h3>
              <p className="sol-meta">2-4 semanas · Sprints reales</p>
              <p>Sprints quincenales. Despliegue progresivo. Ves avances reales cada 14 días, no excusas. Cuando terminamos, tienes una solución en producción generando resultados.</p>
            </div>
          </div>

          <div className="result-bar reveal-up visible">
            <div className="result-item">
              <span className="result-num">60</span><span className="result-suf">–90 días</span>
              <span className="result-lbl">ROI medible</span>
            </div>
            <div className="result-item">
              <span className="result-num">100</span><span className="result-suf">%</span>
              <span className="result-lbl">a medida</span>
            </div>
            <div className="result-item">
              <span className="result-num">0</span>
              <span className="result-lbl">sorpresas en presupuesto</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTERSTITIAL 3 */}
      <section className="interstitial interstitial-accent">
        <div className="container">
          <CinemaText className="cinema-small" text='"¿Y si lo que necesito no existe en el mercado?" — Exacto. Por eso lo construimos nosotros.' />
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicios" className="section">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">Nuestras capacidades</div>
          <h2 className="section-title reveal-up visible">
            Esto es lo mínimo que hacemos.<br />
            <span className="text-gradient">Todo lo demás, lo creamos para ti.</span>
          </h2>
          <p className="section-desc reveal-up visible" style={{ marginBottom: '40px' }}>
            Cada proyecto es único. Estos 5 pilares son nuestro punto de partida — nunca la solución final. Analizamos tu negocio al detalle, combinamos disciplinas y construimos sistemas 100% personalizados que no encontrarás en ningún catálogo. Haz clic en cualquier pilar para explorar.
          </p>

          <div className="services-list">
            {/* Pilar 1 */}
            <div className={`service-row reveal-up visible ${activeService === 1 ? 'active' : ''}`} onClick={() => setActiveService(activeService === 1 ? null : 1)}>
              <div className="service-row-main">
                <div className="service-num">01</div>
                <div className="service-info">
                  <h3>Automatización de Procesos con IA y n8n</h3>
                  <p>Agentes y flujos que ejecutan procesos de back-office, WhatsApp y lectura inteligente de documentos.</p>
                </div>
                <div className="service-pills">
                  <span className="pill pill-sky">n8n / Make</span>
                  <span className="pill pill-sky">IA Cognitiva</span>
                  <span className="pill pill-sky">WhatsApp Business API</span>
                </div>
                <div className="service-toggle-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div className="service-detail" style={{ maxHeight: activeService === 1 ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                <div className="service-detail-inner">
                  <div className="sd-grid">
                    <div className="sd-card">
                      <h5>Impacto Estimado</h5>
                      <span className="sd-val text-sky">-75% tiempo manual</span>
                    </div>
                    <div className="sd-card">
                      <h5>Caso de Uso Real</h5>
                      <p>Inyección automática de facturas desde email a Holded y A3 mediante <strong>KontAI</strong>.</p>
                    </div>
                    <div className="sd-card">
                      <h5>Stack Técnico</h5>
                      <p>n8n, Make, OpenAI Assistants, Python, Webhooks seguros, APIs.</p>
                    </div>
                    <div className="sd-card">
                      <h5>Plazo de Entrega</h5>
                      <span className="sd-val">14–21 días</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className={`service-row reveal-up visible ${activeService === 2 ? 'active' : ''}`} onClick={() => setActiveService(activeService === 2 ? null : 2)}>
              <div className="service-row-main">
                <div className="service-num">02</div>
                <div className="service-info">
                  <h3>Big Data & Analítica de Datos (Power BI y Python)</h3>
                  <p>Pipelines ETL/ELT y cuadros de mando interactivos que unifican tu negocio en tiempo real.</p>
                </div>
                <div className="service-pills">
                  <span className="pill pill-emerald">PowerBI & Python</span>
                  <span className="pill pill-emerald">Databricks Spark</span>
                  <span className="pill pill-emerald">dbt Core</span>
                </div>
                <div className="service-toggle-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div className="service-detail" style={{ maxHeight: activeService === 2 ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                <div className="service-detail-inner">
                  <div className="sd-grid">
                    <div className="sd-card">
                      <h5>Impacto Estimado</h5>
                      <span className="sd-val text-emerald">+40% margen operativo</span>
                    </div>
                    <div className="sd-card">
                      <h5>Caso de Uso Real</h5>
                      <p>Modelado de datos para cruzar presupuestos de marketing digital contra ventas físicas y calcular CAC/LTV exacto.</p>
                    </div>
                    <div className="sd-card">
                      <h5>Stack Técnico</h5>
                      <p>Databricks Spark, dbt Core, Airflow, PostgreSQL, Snowflake, Python.</p>
                    </div>
                    <div className="sd-card">
                      <h5>Plazo de Entrega</h5>
                      <span className="sd-val">21–28 días</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className={`service-row reveal-up visible ${activeService === 3 ? 'active' : ''}`} onClick={() => setActiveService(activeService === 3 ? null : 3)}>
              <div className="service-row-main">
                <div className="service-num">03</div>
                <div className="service-info">
                  <h3>Desarrollo de Software y SaaS a Medida (Next.js & Supabase)</h3>
                  <p>Desarrollo front y back de plataformas SaaS ultra-rápidas y aplicaciones nativas optimizadas.</p>
                </div>
                <div className="service-pills">
                  <span className="pill pill-violet">Next.js / React</span>
                  <span className="pill pill-violet">Supabase (Postgres)</span>
                  <span className="pill pill-violet">Vercel Cloud</span>
                </div>
                <div className="service-toggle-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div className="service-detail" style={{ maxHeight: activeService === 3 ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                <div className="service-detail-inner">
                  <div className="sd-grid">
                    <div className="sd-card">
                      <h5>Impacto Estimado</h5>
                      <span className="sd-val text-violet">100% control de marca</span>
                    </div>
                    <div className="sd-card">
                      <h5>Caso de Uso Real</h5>
                      <p>Portal web multi-inquilino para clínicas con cobros recurrentes vía Stripe y agenda dinámica (**ClinicNova**).</p>
                    </div>
                    <div className="sd-card">
                      <h5>Stack Técnico</h5>
                      <p>React/Next.js, Supabase, TypeScript, PostgreSQL, Vercel, Node.js.</p>
                    </div>
                    <div className="sd-card">
                      <h5>Plazo de Entrega</h5>
                      <span className="sd-val">28–45 días</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pilar 4 */}
            <div className={`service-row reveal-up visible ${activeService === 4 ? 'active' : ''}`} onClick={() => setActiveService(activeService === 4 ? null : 4)}>
              <div className="service-row-main">
                <div className="service-num">04</div>
                <div className="service-info">
                  <h3>Integración de CRM y APIs (HubSpot & Salesforce)</h3>
                  <p>Migraciones de datos complejas e integraciones profundas con Salesforce y HubSpot sin pérdidas de servicio.</p>
                </div>
                <div className="service-pills">
                  <span className="pill pill-rose">Salesforce CRM</span>
                  <span className="pill pill-rose">HubSpot Partner</span>
                  <span className="pill pill-rose">Integraciones API</span>
                </div>
                <div className="service-toggle-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div className="service-detail" style={{ maxHeight: activeService === 4 ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                <div className="service-detail-inner">
                  <div className="sd-grid">
                    <div className="sd-card">
                      <h5>Impacto Estimado</h5>
                      <span className="sd-val text-rose">+25% retención de leads</span>
                    </div>
                    <div className="sd-card">
                      <h5>Caso de Uso Real</h5>
                      <p>Migración de más de 500.000 perfiles de clientes históricos desde bases Access antiguas a Salesforce Sales Cloud.</p>
                    </div>
                    <div className="sd-card">
                      <h5>Stack Técnico</h5>
                      <p>Salesforce SDK, HubSpot API, Rest APIs, Python ETL wrappers, Zapier.</p>
                    </div>
                    <div className="sd-card">
                      <h5>Plazo de Entrega</h5>
                      <span className="sd-val">14–28 días</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pilar 5 */}
            <div className={`service-row reveal-up visible ${activeService === 5 ? 'active' : ''}`} onClick={() => setActiveService(activeService === 5 ? null : 5)}>
              <div className="service-row-main">
                <div className="service-num">05</div>
                <div className="service-info">
                  <h3>Consultoría Tecnológica & Servicios de CTO Externo</h3>
                  <p>Mapeo estratégico de valor, auditoría de código, optimización de infraestructura cloud y diseño de roadmaps.</p>
                </div>
                <div className="service-pills">
                  <span className="pill pill-amber">CTO Externo B2B</span>
                  <span className="pill pill-amber">Auditoría Cloud AWS</span>
                  <span className="pill pill-amber">Estrategia Tecnológica</span>
                </div>
                <div className="service-toggle-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div className="service-detail" style={{ maxHeight: activeService === 5 ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                <div className="service-detail-inner">
                  <div className="sd-grid">
                    <div className="sd-card">
                      <h5>Impacto Estimado</h5>
                      <span className="sd-val text-amber">0% desviaciones técnicas</span>
                    </div>
                    <div className="sd-card">
                      <h5>Caso de Uso Real</h5>
                      <p>Auditoría de costes de AWS para un grupo hotelero, reduciendo la factura cloud un 35% mensual (**StaySync**).</p>
                    </div>
                    <div className="sd-card">
                      <h5>Stack Técnico</h5>
                      <p>Cloud FinOps, Architectural Mapping, AWS/GCP Cost Analyzers, Arquitectura SaaS.</p>
                    </div>
                    <div className="sd-card">
                      <h5>Plazo de Entrega</h5>
                      <span className="sd-val">7–14 días</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section id="calculadora-roi" className="section">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">Simulador de Retorno</div>
          <h2 className="section-title reveal-up visible">
            Calcula el impacto financiero<br />
            <span className="text-gradient">de tu automatización.</span>
          </h2>
          <p className="section-desc reveal-up visible">Arrastra los controles deslizantes para estimar cuántas horas de trabajo manual puedes liberar y cuánto dinero estás dejando sobre la mesa cada año.</p>

          <div className="roi-container reveal-up visible">
            <div className="roi-inputs">
              <div className="roi-control">
                <div className="roi-control-header">
                  <label htmlFor="slider-hours">Horas manuales semanales</label>
                  <span className="roi-val-display"><span>{roiHours}</span>h</span>
                </div>
                <p className="roi-control-sub">Tiempo acumulado que dedica tu equipo a tareas repetitivas (facturas, excels, emails...).</p>
                <input 
                  type="range" 
                  id="slider-hours" 
                  min="5" 
                  max="80" 
                  value={roiHours} 
                  onChange={(e) => setRoiHours(parseInt(e.target.value, 10))}
                  className="roi-slider" 
                  style={{
                    background: `linear-gradient(to right, var(--accent) ${((roiHours - 5) / (80 - 5)) * 100}%, rgba(255, 255, 255, 0.08) ${((roiHours - 5) / (80 - 5)) * 100}%)`
                  }}
                />
                <div className="roi-slider-labels">
                  <span>5h</span><span>20h</span><span>40h</span><span>60h</span><span>80h</span>
                </div>
              </div>

              <div className="roi-control">
                <div className="roi-control-header">
                  <label htmlFor="slider-cost">Coste por hora de trabajo</label>
                  <span className="roi-val-display"><span>{roiCost}</span>€/h</span>
                </div>
                <p className="roi-control-sub">Coste salarial bruto ponderado de los empleados que ejecutan las tareas.</p>
                <input 
                  type="range" 
                  id="slider-cost" 
                  min="15" 
                  max="100" 
                  value={roiCost} 
                  onChange={(e) => setRoiCost(parseInt(e.target.value, 10))}
                  className="roi-slider" 
                  style={{
                    background: `linear-gradient(to right, var(--accent) ${((roiCost - 15) / (100 - 15)) * 100}%, rgba(255, 255, 255, 0.08) ${((roiCost - 15) / (100 - 15)) * 100}%)`
                  }}
                />
                <div className="roi-slider-labels">
                  <span>15€</span><span>30€</span><span>50€</span><span>75€</span><span>100€</span>
                </div>
              </div>
            </div>

            <div className="roi-results-card">
              <div className="roi-card-glow"></div>
              
              <div className="roi-result-item-big">
                <span className="roi-res-label">Ahorro Anual Estimado</span>
                <div className="roi-res-val-group">
                  <span className="roi-res-val text-gradient" id="roi-annual-savings">{savings.annual}</span><span className="roi-res-unit">€</span>
                </div>
              </div>

              <div className="roi-results-grid">
                <div className="roi-sub-result">
                  <span className="roi-sub-lbl">Horas liberadas al mes</span>
                  <span className="roi-sub-val" id="roi-monthly-hours">{savings.monthlyHours} h</span>
                </div>
                <div className="roi-sub-result">
                  <span className="roi-sub-lbl">Retorno de Inversión</span>
                  <span className="roi-sub-val text-emerald" id="roi-payback">{savings.paybackText}</span>
                </div>
              </div>

              <div className="roi-cta-box">
                <p>Este ahorro equivale al <strong>85%</strong> de eficiencia operativa automatizando con n8n e Inteligencia Artificial.</p>
                <a href="#contacto" className="btn-primary magnetic-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  <span>Automatizar este proceso ahora</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR AUTOMATION COMPONENT */}
      <InteractiveSimulator />

      {/* PROJECTS PROOF / PORTFOLIO */}
      <section id="proyectos" className="section section-dark">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">Productos en producción</div>
          <h2 className="section-title reveal-up visible">
            No hablamos de lo que podríamos hacer.<br />
            <span className="text-gradient">Esto ya funciona.</span>
          </h2>

          <div className="projects-showcase">
            <article className="project reveal-up visible" style={{ '--d': '0.05s' }}>
              <div className="project-header">
                <div className="project-meta">
                  <span className="project-tag tag-emerald">Salud</span>
                  <span className="project-status">● En producción</span>
                </div>
                <h3 className="project-name">ClinicNova</h3>
              </div>
              <p className="project-desc">Software a medida para gestión de clínicas médicas. Incluye citas online, recordatorios automáticos por WhatsApp y cobros automatizados con Stripe. <strong>Reduce ausencias un 61%</strong>.</p>
              <div className="project-result">
                <span className="project-big">-61%</span>
                <span className="project-what">ausencias de pacientes</span>
              </div>
              <div className="project-stack">
                <span>n8n / Make</span><span>WhatsApp API</span><span>Stripe</span><span>Supabase</span>
              </div>
              <button className="project-enter" onClick={() => setActiveProject('clinicnova')} aria-label="Ver proyecto ClinicNova">
                <span>Explorar proyecto</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </button>
            </article>

            <article className="project reveal-up visible" style={{ '--d': '0.1s' }}>
              <div className="project-header">
                <div className="project-meta">
                  <span className="project-tag tag-cyan">Contabilidad</span>
                  <span className="project-status">● En producción</span>
                </div>
                <h3 className="project-name">KontAI</h3>
              </div>
              <p className="project-desc">Automatización de contabilidad y lectura de facturas con IA. Lectura cognitiva OCR de facturas PDF, cálculo de IVA/IRPF y exportación a ERP. <strong>4.2 segundos por factura</strong>.</p>
              <div className="project-result">
                <span className="project-big">4.2s</span>
                <span className="project-what">por factura procesada</span>
              </div>
              <div className="project-stack">
                <span>IA Cognitiva</span><span>OCR inteligente</span><span>n8n Workflow</span><span>Supabase</span>
              </div>
              <button className="project-enter" onClick={() => setActiveProject('kontai')} aria-label="Ver proyecto KontAI">
                <span>Explorar proyecto</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </button>
            </article>

            <article className="project reveal-up visible" style={{ '--d': '0.15s' }}>
              <div className="project-header">
                <div className="project-meta">
                  <span className="project-tag tag-amber">Turismo</span>
                  <span className="project-status">● En producción</span>
                </div>
                <h3 className="project-name">4Stancias</h3>
              </div>
              <p className="project-desc">Automatización n8n para apartamentos turísticos. Check-in digital automatizado, mensajes por WhatsApp y sincronización con Channel Manager. <strong>Solo 30 minutos semanales</strong>.</p>
              <div className="project-result">
                <span className="project-big">30min</span>
                <span className="project-what">de gestión por semana</span>
              </div>
              <div className="project-stack">
                <span>n8n / Make</span><span>WhatsApp API</span><span>Calendar Sync</span>
              </div>
              <button className="project-enter" onClick={() => setActiveProject('4stancias')} aria-label="Ver proyecto 4Stancias">
                <span>Explorar proyecto</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </button>
            </article>

            <article className="project reveal-up visible" style={{ '--d': '0.2s' }}>
              <div className="project-header">
                <div className="project-meta">
                  <span className="project-tag tag-violet">Hotelería</span>
                  <span className="project-status">● En producción</span>
                </div>
                <h3 className="project-name">StaySync</h3>
              </div>
              <p className="project-desc">SaaS de hotelería con CRM y automatización de WhatsApp. Channel Manager (Beds24) conectado con bases de datos Supabase. <strong>Evita overbookings en tiempo real.</strong></p>
              <div className="project-result">
                <span className="project-big">0</span>
                <span className="project-what">overbookings</span>
              </div>
              <div className="project-stack">
                <span>Beds24 API</span><span>n8n Workflow</span><span>WhatsApp API</span><span>Supabase</span>
              </div>
              <button className="project-enter" onClick={() => setActiveProject('staysync')} aria-label="Ver proyecto StaySync">
                <span>Explorar proyecto</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* INTERSTITIAL 4 */}
      <section className="interstitial">
        <div className="container">
          <CinemaText text="Cada uno de estos productos se diseñó, construyó y lanzó en menos de 4 semanas. El tuyo también puede estarlo." />
        </div>
      </section>

      {/* PROCESS */}
      <section id="proceso" className="section">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">Proceso</div>
          <h2 className="section-title reveal-up visible">
            De la idea a producción<br />
            <span className="text-gradient">en semanas, no meses.</span>
          </h2>

          <div className="process-timeline">
            <div className="process-step reveal-up visible">
              <div className="step-marker">
                <span className="step-n">01</span><div className="step-line"></div>
              </div>
              <div className="step-content">
                <span className="step-time">30 minutos</span>
                <h3>Videollamada de diagnóstico</h3>
                <p>Sin compromiso, sin coste. Nos cuentas tu situación real. Identificamos los 3-5 procesos que más tiempo y dinero te cuestan. Te damos un diagnóstico claro el mismo día.</p>
              </div>
            </div>

            <div className="process-step reveal-up visible">
              <div className="step-marker">
                <span className="step-n">02</span><div className="step-line"></div>
              </div>
              <div className="step-content">
                <span className="step-time">1 semana</span>
                <h3>Arquitectura y presupuesto cerrado</h3>
                <p>Diseñamos la solución técnica completa. Te presentamos un documento con qué se va a construir, cómo, cuándo y por cuánto. Presupuesto cerrado. Sin el clásico "esto no entraba".</p>
              </div>
            </div>

            <div className="process-step reveal-up visible">
              <div className="step-marker">
                <span className="step-n">03</span>
              </div>
              <div className="step-content">
                <span className="step-time">2–4 semanas</span>
                <h3>Construcción y lanzamiento</h3>
                <p>Sprints quincenales con demos reales. No te enseñamos mockups — te enseñamos software funcionando. Despliegue progresivo hasta producción total.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section id="diferenciacion" className="section section-dark">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">Diferenciación</div>
          <h2 className="section-title reveal-up visible">
            ¿Por qué no somos<br />
            <span className="text-gradient">una agencia más?</span>
          </h2>

          <div className="diff-table">
            <div className="diff-header">
              <span></span><span>Agencia típica</span><span className="diff-us">XTech</span>
            </div>
            <div className="diff-row reveal-up visible">
              <span className="diff-label">Enfoque</span>
              <span className="diff-them">Soluciones de catálogo</span>
              <span className="diff-ours">100% a medida para tu negocio</span>
            </div>
            <div className="diff-row reveal-up visible">
              <span className="diff-label">Relación</span>
              <span className="diff-them">Entregan y desaparecen</span>
              <span className="diff-ours">Partners a largo plazo</span>
            </div>
            <div className="diff-row reveal-up visible">
              <span className="diff-label">Alcance</span>
              <span className="diff-them">"Hacemos webs"</span>
              <span className="diff-ours">IA + Data + Apps + CRM + Cloud</span>
            </div>
            <div className="diff-row reveal-up visible">
              <span className="diff-label">Estrategia</span>
              <span className="diff-them">Tecnología por tecnología</span>
              <span className="diff-ours">Cada decisión impacta tu facturación</span>
            </div>
            <div className="diff-row reveal-up visible">
              <span className="diff-label">Resultados</span>
              <span className="diff-them">"Ya veremos cómo va"</span>
              <span className="diff-ours">ROI medible en 60-90 días</span>
            </div>
            <div className="diff-row reveal-up visible">
              <span className="diff-label">Presupuesto</span>
              <span className="diff-them">Extras y sorpresas</span>
              <span className="diff-ours">Cerrado desde el día 1</span>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonios" className="section">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">Testimonios</div>
          <h2 className="section-title reveal-up visible">
            Lo que dicen quienes ya<br />
            <span className="text-gradient">trabajan con nosotros.</span>
          </h2>

          <div className="testimonials">
            <blockquote className="testimonial reveal-up visible">
              <p className="testi-text">"Redujeron nuestras ausencias un <strong>61% en tres semanas</strong>. Los pacientes reciben recordatorio por WhatsApp y confirman con un clic. Antes perdíamos 4 horas diarias gestionando citas a mano."</p>
              <footer className="testi-author">
                <div className="testi-avatar av-1">MC</div>
                <div>
                  <cite className="testi-name">María Castillo</cite>
                  <span className="testi-role">Directora · Clínica Privada</span>
                </div>
              </footer>
            </blockquote>

            <blockquote className="testimonial reveal-up visible">
              <p className="testi-text">"Procesamos facturas en <strong>4.2 segundos</strong>. Antes tardábamos 20 minutos por factura. KontAI nos ha devuelto semanas enteras de trabajo al año."</p>
              <footer className="testi-author">
                <div className="testi-avatar av-2">JL</div>
                <div>
                  <cite className="testi-name">Javier López</cite>
                  <span className="testi-role">CEO · Despacho Contable</span>
                </div>
              </footer>
            </blockquote>

            <blockquote className="testimonial reveal-up visible">
              <p className="testi-text">"Pasamos de 20 emails diarios a 6. Y <strong>cero overbookings</strong>. Ahora dedico el tiempo a mis huéspedes, no a pelear con canales de reservas."</p>
              <footer className="testi-author">
                <div className="testi-avatar av-3">AR</div>
                <div>
                  <cite className="testi-name">Ana Rodríguez</cite>
                  <span className="testi-role">Gerente · Hotel Boutique</span>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section section-dark">
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="section-label reveal-up visible">FAQ</div>
          <h2 className="section-title reveal-up visible">
            Preguntas que nos hacen<br />
            <span className="text-gradient">antes de empezar.</span>
          </h2>

          <div className="faq-list">
            {[
              { q: '¿Trabajáis con cualquier tipo de empresa?', a: 'Trabajamos con empresas que ya facturan y tienen procesos que quieren optimizar. No necesitas ser grande — si pierdes más de 5 horas a la semana en tareas manuales, podemos ayudarte.' },
              { q: '¿Cuánto cuesta una automatización real?', a: 'La mayoría de proyectos arrancan desde 2.000€. Siempre presupuesto cerrado. Sin sorpresas. El ROI suele recuperarse en 60-90 días.' },
              { q: '¿Qué pasa si ya tenemos herramientas contratadas?', a: 'Perfecto. Trabajamos con lo que ya tienes. Conectamos, automatizamos y potenciamos tus herramientas actuales — no te obligamos a cambiar de stack.' },
              { q: '¿Necesitamos saber programar?', a: 'No. Todo tiene interfaz intuitiva. Incluimos formación y soporte para que tu equipo sea autónomo desde el día 1.' },
              { q: '¿Ofrecéis soporte después de la entrega?', a: 'Sí. Soporte post-lanzamiento incluido. Planes de mantenimiento mensual disponibles para quienes quieren un partner técnico permanente.' },
              { q: '¿Cuánto tardáis en tener algo funcionando?', a: '2-4 semanas la mayoría de automatizaciones. Proyectos más complejos se entregan en sprints quincenales — siempre ves avances reales, nunca promesas vacías.' }
            ].map((faq, idx) => (
              <details 
                key={idx} 
                className="faq-item reveal-up visible" 
                open={activeFaq === idx}
              >
                <summary onClick={(e) => { e.preventDefault(); setActiveFaq(activeFaq === idx ? null : idx); }}>
                  <span>{faq.q}</span>
                  <div className="faq-plus"><span></span><span></span></div>
                </summary>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA & BOOKING COMPONENT */}
      <section id="contacto" className="section section-cta-final">
        <ParticleCanvas
          id="cta-canvas"
          count={15}
          maxDist={90}
          speed={0.1}
          mouseRadius={160}
          baseColor={[148, 163, 184]}
          accentColor={[37, 99, 235]}
          className="cta-canvas"
        />
        <div className="grid-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="booking-grid">
            <div className="booking-left reveal-up visible">
              <div className="section-label">Da el paso</div>
              <h2 className="cta-title">
                Cada semana que pasa sin automatizar<br />
                <span className="text-gradient">es dinero que se quema.</span>
              </h2>
              <p className="cta-desc">Reserva una sesión de diagnóstico tecnológico gratuita de 1 hora. Analizaremos tus ineficiencias operativas y saldrás con un plan de automatización e IA claro y medible. Sin compromiso alguno.</p>
              
              <ul className="booking-features">
                <li>
                  <div className="bf-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className="bf-content">
                    <strong>Auditoría de Ineficiencias</strong>
                    <p>Identificamos tareas manuales repetitivas que queman tiempo de tu equipo.</p>
                  </div>
                </li>
                <li>
                  <div className="bf-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className="bf-content">
                    <strong>Diseño de Blueprint Técnico</strong>
                    <p>Propuesta de flujo con automatizaciones e Inteligencia Artificial.</p>
                  </div>
                </li>
                <li>
                  <div className="bf-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className="bf-content">
                    <strong>Estimación del ROI Real</strong>
                    <p>Calculamos el retorno financiero y de tiempo exacto antes de empezar.</p>
                  </div>
                </li>
              </ul>

              <div className="booking-trust-badges">
                <span className="trust-badge">100% Gratuito</span>
                <span className="trust-badge">Sin Compromiso</span>
                <span className="trust-badge">Videollamada de 1h</span>
              </div>
            </div>

            <div className="booking-right reveal-up visible">
              <BookingCalendar />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" role="contentinfo">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#" className="nav-logo">
                <span className="logo-icon">X</span>
                <span className="logo-text">Tech</span>
              </a>
              <p>Consultoría tecnológica integral.<br />Murcia, España.</p>
            </div>
            <div className="footer-cols">
              <div>
                <h4>Servicios</h4>
                <ul>
                  <li><a href="#servicios">Automatización IA</a></li>
                  <li><a href="#servicios">Big Data & BI</a></li>
                  <li><a href="#servicios">Apps Web & Móvil</a></li>
                  <li><a href="#servicios">CRM & Migraciones</a></li>
                  <li><a href="#servicios">Consultoría</a></li>
                </ul>
              </div>
              <div>
                <h4>Productos</h4>
                <ul>
                  <li><a href="#proyectos">ClinicNova</a></li>
                  <li><a href="#proyectos">KontAI</a></li>
                  <li><a href="#proyectos">4Stancias</a></li>
                  <li><a href="#proyectos">StaySync</a></li>
                </ul>
              </div>
              <div>
                <h4>Empresa</h4>
                <ul>
                  <li><a href="#proceso">Proceso</a></li>
                  <li><a href="#faq">FAQ</a></li>
                  <li><a href="#contacto">Contacto</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 XTech Consultant. Todos los derechos reservados.</p>
            <div className="footer-legal-links">
              <button className="legal-trigger-btn" onClick={() => setActiveLegalTab('aviso')}>Aviso Legal</button>
              <button className="legal-trigger-btn" onClick={() => setActiveLegalTab('privacidad')}>Política de Privacidad</button>
              <button className="legal-trigger-btn" onClick={() => setActiveLegalTab('cookies')}>Política de Cookies</button>
            </div>
          </div>
        </div>
      </footer>

      {/* PROJECT MODAL (Immersive Full-Screen) */}
      {activeProject && (() => {
        const pData = projectData[activeProject];
        if (!pData) return null;
        return (
          <div className="pm open" id="project-modal" aria-hidden="false">
            <div className="pm-backdrop" onClick={() => setActiveProject(null)}></div>
            <div className="pm-container">
              <button className="pm-close" onClick={() => setActiveProject(null)} aria-label="Cerrar proyecto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
              </button>
              <div className="pm-scroll">
                {/* Hero */}
                <div className="pm-hero" style={{ background: 'linear-gradient(to bottom, #111827, #030712)' }}>
                  <div className="pm-hero-content">
                    <div className={`pm-tag ${pData.tagClass}`}>{pData.tag}</div>
                    <h2 className="pm-title">{pData.name}</h2>
                    <p className="pm-subtitle">{pData.subtitle}</p>
                    <div className="pm-hero-stat">
                      <span className="pm-big">{pData.bigStat}</span>
                      <span className="pm-what">{pData.bigLabel}</span>
                    </div>
                  </div>
                </div>
                {/* Content sections */}
                <div className="pm-body">
                  <div className="pm-section">
                    <div className="pm-section-label">El problema</div>
                    <h3 className="pm-section-title">{pData.problem.title}</h3>
                    <p className="pm-section-text">{pData.problem.text}</p>
                  </div>
                  <div className="pm-section">
                    <div className="pm-section-label">La solución</div>
                    <h3 className="pm-section-title">{pData.solution.title}</h3>
                    <p className="pm-section-text">{pData.solution.text}</p>
                  </div>
                  <div className="pm-section">
                    <div className="pm-section-label">Cómo funciona</div>
                    <div className="pm-steps">
                      {pData.steps.map((s, i) => (
                        <div className="pm-step-card" key={i}>
                          <span className="pm-step-num">{String(i + 1).padStart(2, '0')}</span>
                          <h4>{s.title}</h4>
                          <p>{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pm-section">
                    <div className="pm-section-label">Resultados reales</div>
                    <div className="pm-metrics">
                      {pData.metrics.map((m, i) => (
                        <div className="pm-metric-card" key={i}>
                          <span className="pm-metric-val text-gradient">{m.value}</span>
                          <span className="pm-metric-lbl">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pm-section">
                    <div className="pm-section-label">Tecnología</div>
                    <div className="pm-tech">
                      {pData.tech.map((t, i) => (
                        <span key={i} className="tech-badge">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pm-section pm-cta-section">
                    <h3 className="pm-cta-title">¿Quieres algo parecido para tu negocio?</h3>
                    <p className="pm-cta-desc">Hablemos. Te explicamos cómo podemos construir algo similar adaptado a tu caso.</p>
                    <a href="#contacto" onClick={() => setActiveProject(null)} className="btn-primary magnetic-btn pm-cta-btn">
                      <span>Hablar con un experto</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* LEGAL CENTER MODAL */}
      {activeLegalTab && (
        <div className="pm legal-modal open" id="legal-modal" aria-hidden="false">
          <div className="pm-backdrop" onClick={() => setActiveLegalTab(null)}></div>
          <div className="pm-container">
            <button className="pm-close" onClick={() => setActiveLegalTab(null)} aria-label="Cerrar Centro Legal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
            </button>
            
            <div className="legal-header">
              <div className="legal-title-area">
                <span className="pm-tag tag-cyan">Centro Legal</span>
                <h2 className="legal-title">XTech Consultant</h2>
              </div>
              <div className="legal-tabs" role="tablist">
                <button className={`legal-tab-btn ${activeLegalTab === 'aviso' ? 'active' : ''}`} onClick={() => setActiveLegalTab('aviso')} role="tab" aria-selected={activeLegalTab === 'aviso'}>Aviso Legal</button>
                <button className={`legal-tab-btn ${activeLegalTab === 'privacidad' ? 'active' : ''}`} onClick={() => setActiveLegalTab('privacidad')} role="tab" aria-selected={activeLegalTab === 'privacidad'}>Privacidad</button>
                <button className={`legal-tab-btn ${activeLegalTab === 'cookies' ? 'active' : ''}`} onClick={() => setActiveLegalTab('cookies')} role="tab" aria-selected={activeLegalTab === 'cookies'}>Cookies</button>
              </div>
            </div>

            <div className="pm-scroll">
              <div className="pm-body legal-body">
                {activeLegalTab === 'aviso' && (
                  <div role="tabpanel">
                    <h3>Aviso Legal y Condiciones de Uso</h3>
                    <p className="legal-intro">En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los datos identificativos de la empresa:</p>
                    <div className="legal-grid">
                      <div className="legal-card">
                        <strong>Denominación Social</strong>
                        <span>XTech Consultant SL (en constitución)</span>
                      </div>
                      <div className="legal-card">
                        <strong>NIF/CIF</strong>
                        <span>B-00000000</span>
                      </div>
                      <div className="legal-card">
                        <strong>Domicilio Social</strong>
                        <span>Plaza Circular, Murcia, España</span>
                      </div>
                      <div className="legal-card">
                        <strong>Email de Contacto</strong>
                        <span>xtechconsultantit@gmail.com</span>
                      </div>
                    </div>
                    <h4>1. Propiedad Intelectual e Industrial</h4>
                    <p>Todos los derechos de propiedad intelectual e industrial del contenido de este sitio web, incluyendo marcas, logotipos, código fuente, interfaces y diseños de software (como ClinicNova, KontAI, 4Stancias y StaySync), son titularidad exclusiva de XTech Consultant o de sus respectivos licenciantes. Queda prohibida cualquier reproducción o distribución sin autorización expresa.</p>
                    <h4>2. Limitación de Responsabilidad</h4>
                    <p>Este sitio web tiene carácter puramente informativo de los servicios y productos tecnológicos desarrollados por XTech. No nos hacemos responsables de las decisiones tomadas por el usuario basadas exclusivamente en la información aquí publicada, ni de posibles daños técnicos derivados del acceso a la web.</p>
                  </div>
                )}

                {activeLegalTab === 'privacidad' && (
                  <div role="tabpanel">
                    <h3>Política de Privacidad y Protección de Datos</h3>
                    <p className="legal-intro">De acuerdo con el Reglamento General de Protección de Datos (RGPD) de la UE y la Ley Orgánica 3/2018 (LOPDGDD), informamos de cómo tratamos tus datos personales:</p>
                    <div className="legal-list">
                      <div className="legal-list-item">
                        <div className="li-icon">1</div>
                        <div>
                          <h5>Responsable del Tratamiento</h5>
                          <p>XTech Consultant SL, con email: <strong>xtechconsultantit@gmail.com</strong>.</p>
                        </div>
                      </div>
                      <div className="legal-list-item">
                        <div className="li-icon">2</div>
                        <div>
                          <h5>Finalidad del Tratamiento</h5>
                          <p>Gestionar las consultas recibidas a través de nuestro formulario de contacto o email, programar llamadas de diagnóstico gratuitas y enviar propuestas de consultoría tecnológica.</p>
                        </div>
                      </div>
                      <div className="legal-list-item">
                        <div className="li-icon">3</div>
                        <div>
                          <h5>Legitimación</h5>
                          <p>Consentimiento explícito del usuario al enviarnos un correo electrónico o al interactuar con nuestros canales de contacto directos.</p>
                        </div>
                      </div>
                      <div className="legal-list-item">
                        <div className="li-icon">4</div>
                        <div>
                          <h5>Derechos del Usuario</h5>
                          <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación y oposición enviando un correo con copia de tu documento de identidad a <strong>xtechconsultantit@gmail.com</strong>.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeLegalTab === 'cookies' && (
                  <div role="tabpanel">
                    <h3>Política de Cookies</h3>
                    <p className="legal-intro">Este sitio web utiliza cookies para optimizar y analizar tu navegación. Una cookie es un pequeño archivo de texto que se almacena en tu navegador cuando visitas casi cualquier página web.</p>
                    <h4>¿Qué tipo de cookies utiliza este sitio?</h4>
                    <div className="legal-grid">
                      <div className="legal-card cookies-card">
                        <strong>Cookies Técnicas (Necesarias)</strong>
                        <p>Obligatorias para el correcto funcionamiento de la web, como guardar tu preferencia de consentimiento de cookies.</p>
                      </div>
                      <div className="legal-card cookies-card">
                        <strong>Cookies Analíticas (Opcionales)</strong>
                        <p>Nos permiten medir de forma anónima el número de visitas, velocidad del sitio y secciones más visitadas para mejorar el rendimiento técnico global.</p>
                      </div>
                    </div>
                    <h4>Gestión y Desactivación</h4>
                    <p>Puedes restringir, bloquear o borrar las cookies de cualquier sitio web utilizando la configuración de tu navegador. Si desactivas las cookies técnicas necesarias, es posible que el rendimiento o funciones básicas de la web se vean limitados.</p>
                    <p>Para revocar tu consentimiento o cambiar la configuración actual del sitio, puedes borrar los datos de navegación de este dominio.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COOKIE CONSENT BANNER */}
      {showCookies && (
        <div id="cookie-banner" className="cookie-banner open" role="dialog" aria-live="polite" aria-labelledby="cb-title">
          <div className="cb-inner">
            <div className="cb-content">
              <h4 id="cb-title" className="cb-title">Control de Privacidad</h4>
              <p className="cb-text">
                Utilizamos cookies para analizar el rendimiento del sitio y mejorar tu experiencia. Al hacer clic en "Aceptar", consientes su uso. Puedes configurar tus preferencias en cualquier momento. Ver nuestra <button className="legal-link-inline-btn" onClick={() => setActiveLegalTab('cookies')}>Política de Cookies</button>.
              </p>
            </div>
            <div className="cb-actions">
              <button id="cb-reject" className="btn-cb btn-cb-ghost" onClick={() => handleCookieConsent(false)}>Rechazar</button>
              <button id="cb-accept" className="btn-cb btn-cb-primary" onClick={() => handleCookieConsent(true)}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
