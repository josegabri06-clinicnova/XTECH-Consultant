'use client';

import React, { useState, useEffect, useRef } from 'react';

const SIM_DATA = {
  clinica: {
    title: 'Gestión inteligente de citas médicas',
    deployTime: '2-3 semanas',
    nodes: [
      { icon: '📱', label: 'Paciente', detail: 'Solicita cita online', color: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
      { icon: '🤖', label: 'ClinicNova IA', detail: 'Verifica disponibilidad', color: '#6366f1', glow: 'rgba(99,102,241,0.25)' },
      { icon: '⚙️', label: 'Pipeline', detail: 'Agenda automáticamente', color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
      { icon: '💬', label: 'WhatsApp', detail: 'Envía recordatorio', color: '#10b981', glow: 'rgba(16,185,129,0.25)' }
    ],
    status: [
      'Recibiendo solicitud de cita…',
      'IA verificando disponibilidad en tiempo real…',
      'Agendando cita en el calendario…',
      '✓ Confirmación y recordatorio enviados por WhatsApp'
    ],
    before: [
      { val: '4h/día', desc: 'gestionando citas' },
      { val: '30%', desc: 'pacientes no aparecen' },
      { val: '~8', desc: 'errores de agenda/sem' }
    ],
    after: [
      { val: '0h', desc: 'gestión manual' },
      { val: '-61%', desc: 'ausencias' },
      { val: '0', desc: 'errores de agenda' }
    ]
  },
  gestoria: {
    title: 'Procesamiento automático de facturas',
    deployTime: '2-4 semanas',
    nodes: [
      { icon: '📧', label: 'Email', detail: 'Recibe factura PDF', color: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
      { icon: '🧠', label: 'IA Cognitiva + IDP', detail: 'Extrae datos contables', color: '#6366f1', glow: 'rgba(99,102,241,0.25)' },
      { icon: '⚙️', label: 'Pipeline', detail: 'Valida y clasifica', color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
      { icon: '📊', label: 'Holded / ERP', detail: 'Registra automáticamente', color: '#10b981', glow: 'rgba(16,185,129,0.25)' }
    ],
    status: [
      'Factura detectada en bandeja de entrada…',
      'IA extrayendo importe, IVA, proveedor y fecha…',
      'Validando datos y clasificando por categoría…',
      '✓ Factura registrada en Holded automáticamente'
    ],
    before: [
      { val: '20 min', desc: 'por factura' },
      { val: '12', desc: 'errores contables/mes' },
      { val: '60h', desc: 'manuales al mes' }
    ],
    after: [
      { val: '4.2 seg', desc: 'por factura' },
      { val: '0', desc: 'errores contables' },
      { val: '0h', desc: 'trabajo manual' }
    ]
  },
  hotel: {
    title: 'Check-in digital y coordinación automática',
    deployTime: '3-4 semanas',
    nodes: [
      { icon: '🏨', label: 'Reserva', detail: 'Confirmada en Booking', color: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
      { icon: '💬', label: 'WhatsApp', detail: 'Bienvenida + instrucciones', color: '#6366f1', glow: 'rgba(99,102,241,0.25)' },
      { icon: '🔑', label: 'Check-in', detail: 'Acceso digital sin llave', color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
      { icon: '🧹', label: 'Limpieza', detail: 'Asignada automáticamente', color: '#10b981', glow: 'rgba(16,185,129,0.25)' }
    ],
    status: [
      'Nueva reserva detectada en el channel manager…',
      'Enviando mensaje de bienvenida por WhatsApp…',
      'Generando código de acceso digital…',
      '✓ Limpieza asignada al equipo correspondiente'
    ],
    before: [
      { val: '20', desc: 'emails manuales/día' },
      { val: '25h', desc: 'de gestión/semana' },
      { val: '3-5', desc: 'overbookings al mes' }
    ],
    after: [
      { val: '0', desc: 'emails manuales' },
      { val: '30 min', desc: 'de gestión/semana' },
      { val: '0', desc: 'overbookings' }
    ]
  },
  comercio: {
    title: 'Captación y respuesta automática a leads',
    deployTime: '2-3 semanas',
    nodes: [
      { icon: '🌐', label: 'Web / Redes', detail: 'Lead entra por formulario', color: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
      { icon: '🤖', label: 'IA', detail: 'Cualifica e interpreta', color: '#6366f1', glow: 'rgba(99,102,241,0.25)' },
      { icon: '📋', label: 'CRM', detail: 'Ficha creada y asignada', color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
      { icon: '✉️', label: 'Email', detail: 'Respuesta personalizada', color: '#10b981', glow: 'rgba(16,185,129,0.25)' }
    ],
    status: [
      'Nuevo lead recibido desde el formulario…',
      'IA analizando perfil, intención y urgencia…',
      'Ficha creada en CRM y asignada a ventas…',
      '✓ Email personalizado enviado en < 1 minuto'
    ],
    before: [
      { val: '2h', desc: 'tiempo respuesta medio' },
      { val: '40%', desc: 'leads sin respuesta' },
      { val: 'Manual', desc: 'seguimiento comercial' }
    ],
    after: [
      { val: '< 1 min', desc: 'tiempo de respuesta' },
      { val: '0%', desc: 'leads perdidos' },
      { val: '100%', desc: 'seguimiento auto' }
    ]
  }
};

export default function InteractiveSimulator() {
  const [activeSector, setActiveSector] = useState('clinica');
  const [currentNodeIdx, setCurrentNodeIdx] = useState(-1);
  const [processingNodeIdx, setProcessingNodeIdx] = useState(-1);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [statusText, setStatusText] = useState('');
  
  const timeoutsRef = useRef([]);
  const simRef = useRef(null);
  const hasAutoPlayed = useRef(false);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const runSimulation = (sectorKey) => {
    clearAllTimeouts();
    const data = SIM_DATA[sectorKey];
    if (!data) return;

    // Reset states
    setCurrentNodeIdx(-1);
    setProcessingNodeIdx(-1);
    setAnimationProgress(0);
    setShowComparison(false);
    setShowCta(false);
    setStatusText('');

    const stepDelay = 700;

    data.nodes.forEach((_, i) => {
      const delay = 300 + i * stepDelay;

      // Activar nodo y procesado
      const t1 = setTimeout(() => {
        setCurrentNodeIdx(i);
        setProcessingNodeIdx(i);
        setStatusText(data.status[i]);
        setAnimationProgress(((i + 1) / data.nodes.length) * 100);

        // Desactivar estado processing tras un pulso
        const t2 = setTimeout(() => {
          setProcessingNodeIdx(-1);
        }, 500);
        timeoutsRef.current.push(t2);

      }, delay);
      timeoutsRef.current.push(t1);
    });

    // Mostrar comparativas
    const totalDelay = 300 + data.nodes.length * stepDelay + 300;
    const tCompare = setTimeout(() => {
      setShowComparison(true);
    }, totalDelay);
    timeoutsRef.current.push(tCompare);

    // Mostrar CTA final
    const tCta = setTimeout(() => {
      setShowCta(true);
    }, totalDelay + 400);
    timeoutsRef.current.push(tCta);
  };

  useEffect(() => {
    runSimulation(activeSector);
    return clearAllTimeouts;
  }, [activeSector]);

  // Auto-play on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoPlayed.current) {
            hasAutoPlayed.current = true;
            runSimulation(activeSector);
          }
        });
      },
      { threshold: 0.25 }
    );

    if (simRef.current) {
      observer.observe(simRef.current);
    }

    return () => observer.disconnect();
  }, [activeSector]);

  const handleSectorChange = (sector) => {
    if (sector === activeSector) return;
    setActiveSector(sector);
  };

  const handleReplay = () => {
    runSimulation(activeSector);
  };

  const currentData = SIM_DATA[activeSector];

  return (
    <section id="simulador" ref={simRef} className="section section-dark">
      <div className="grid-mesh" aria-hidden="true"></div>
      <div className="container">
        <div className="section-label reveal-up visible">Simulador en vivo</div>
        <h2 className="section-title reveal-up visible">
          Esto es solo una muestra.<br />
          <span className="text-gradient">Tu solución será 100% a medida.</span>
        </h2>
        <p className="section-desc reveal-up visible">
          Estos flujos son ejemplos reales simplificados. Lo que construimos para ti será completamente personalizado: analizamos tu negocio, tus procesos y tus herramientas para diseñar una automatización única que no existe en ningún catálogo.
        </p>

        <div className="sim-wrapper reveal-up visible">
          {/* Header */}
          <div class="sim-header">
            <div class="sim-live-badge"><span class="sim-live-dot"></span> SIMULACIÓN EN VIVO</div>
            <button className="sim-replay-btn" onClick={handleReplay} aria-label="Repetir simulación">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>Repetir</span>
            </button>
          </div>

          {/* Sector tabs */}
          <div className="sim-sectors" role="tablist" aria-label="Selecciona tu sector">
            <button
              className={`sim-sector ${activeSector === 'clinica' ? 'active' : ''}`}
              onClick={() => handleSectorChange('clinica')}
              role="tab"
              aria-selected={activeSector === 'clinica'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Clínica</span>
            </button>
            <button
              className={`sim-sector ${activeSector === 'gestoria' ? 'active' : ''}`}
              onClick={() => handleSectorChange('gestoria')}
              role="tab"
              aria-selected={activeSector === 'gestoria'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
              <span>Gestoría</span>
            </button>
            <button
              className={`sim-sector ${activeSector === 'hotel' ? 'active' : ''}`}
              onClick={() => handleSectorChange('hotel')}
              role="tab"
              aria-selected={activeSector === 'hotel'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Hotel</span>
            </button>
            <button
              className={`sim-sector ${activeSector === 'comercio' ? 'active' : ''}`}
              onClick={() => handleSectorChange('comercio')}
              role="tab"
              aria-selected={activeSector === 'comercio'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>Comercio</span>
            </button>
          </div>

          {/* Flow title */}
          <h3 className={`sim-flow-title ${currentNodeIdx >= 0 ? 'visible' : ''}`} id="sim-flow-title">
            {currentData?.title}
          </h3>

          {/* Pipeline */}
          <div className="sim-pipeline" id="sim-pipeline" role="tabpanel" aria-live="polite">
            {currentData?.nodes.map((node, i) => (
              <React.Fragment key={i}>
                <div
                  className={`sim-node ${currentNodeIdx >= i ? 'active' : ''} ${processingNodeIdx === i ? 'processing' : ''}`}
                  style={{
                    '--node-color': node.color,
                    '--node-glow': node.glow,
                  }}
                >
                  <div className="sim-node-icon">{node.icon}</div>
                  <div className="sim-node-label">{node.label}</div>
                  <div className="sim-node-detail">{node.detail}</div>
                </div>

                {i < currentData.nodes.length - 1 && (
                  <div className={`sim-connector ${currentNodeIdx > i ? 'active' : ''}`}>
                    <div className="sim-connector-line"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Status bar */}
          <div className="sim-status-bar">
            <div className="sim-progress-track">
              <div className="sim-progress-fill" style={{ width: `${animationProgress}%` }}></div>
            </div>
            <div className="sim-status-text" id="sim-status-text">
              {statusText}
            </div>
          </div>

          {/* Before/After comparison */}
          <div className={`sim-comparison ${showComparison ? 'visible' : ''}`} id="sim-comparison">
            <div className="sim-col sim-col-before">
              <div className="sim-compare-label">❌ Sin automatización</div>
              {currentData?.before.map((m, idx) => (
                <div className="sim-metric-row" key={idx}>
                  <span className="sim-metric-val">{m.val}</span>
                  <span className="sim-metric-desc">{m.desc}</span>
                </div>
              ))}
            </div>
            
            <div className="sim-col-vs">VS</div>
            
            <div className="sim-col sim-col-after">
              <div className="sim-compare-label">✅ Con XTech</div>
              {currentData?.after.map((m, idx) => (
                <div className="sim-metric-row" key={idx}>
                  <span className="sim-metric-val">{m.val}</span>
                  <span className="sim-metric-desc">{m.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={`sim-bottom-cta ${showCta ? 'visible' : ''}`} id="sim-bottom-cta">
            <p>Este flujo se implementa en <strong>{currentData?.deployTime}</strong>. Sin sorpresas.</p>
            <a href="#contacto" className="btn-primary magnetic-btn">
              <span>¿Quieres esto para tu negocio?</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
