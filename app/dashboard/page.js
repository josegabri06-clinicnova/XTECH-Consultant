'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('resumen'); // 'resumen' | 'kontai' | 'clinicnova' | 'perfil'
  const [invoices, setInvoices] = useState([
    { id: '1', date: '08/07/2026', emisor: 'Amazon Web Services', nif: 'EU372002132', base: 142.50, tax: 29.93, status: 'procesada', erp: 'Holded' },
    { id: '2', date: '07/07/2026', emisor: 'Google Cloud Platform', nif: 'IE6388047V', base: 89.00, tax: 18.69, status: 'procesada', erp: 'Holded' },
    { id: '3', date: '05/07/2026', emisor: 'Stripe Payments', nif: 'IE3207593Q', base: 240.00, tax: 50.40, status: 'procesada', erp: 'Holded' },
    { id: '4', date: '02/07/2026', emisor: 'Vercel Inc.', nif: 'US472093847', base: 40.00, tax: 8.40, status: 'pendiente', erp: 'Ninguno' },
  ]);
  const [newInvoiceFile, setNewInvoiceFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      // 1. Verificar Supabase
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUser({
          email: data.session.user.email,
          name: data.session.user.user_metadata?.full_name || 'Cliente XTech',
          company: data.session.user.user_metadata?.company_name || 'Mi PYME',
        });
        return;
      }

      // 2. Fallback de desarrollo local
      const localUser = localStorage.getItem('xtech_session');
      if (localUser) {
        const parsed = JSON.parse(localUser);
        setUser({
          email: parsed.email,
          name: parsed.name,
          company: parsed.company || 'Nova S.L.',
        });
      } else {
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('xtech_session');
    router.push('/');
  };

  const handleInvoiceUpload = (e) => {
    e.preventDefault();
    if (!newInvoiceFile) return;
    setUploading(true);
    setUploadMessage('Subiendo factura a Kontai IA...');

    setTimeout(() => {
      const newInv = {
        id: String(invoices.length + 1),
        date: new Date().toLocaleDateString('es-ES'),
        emisor: 'Factura Subida (Leyendo factura con IA...)',
        nif: 'Buscando...',
        base: 0,
        tax: 0,
        status: 'procesando',
        erp: 'Pendiente'
      };
      setInvoices([newInv, ...invoices]);
      setUploadMessage('');
      setUploading(false);

      // Simular OCR en 4.2 segundos
      setTimeout(() => {
        setInvoices(prev => prev.map(inv => {
          if (inv.id === newInv.id) {
            return {
              ...inv,
              emisor: 'DigitalOcean LLC',
              nif: 'US38201293',
              base: 56.00,
              tax: 11.76,
              status: 'procesada',
              erp: 'Holded'
            };
          }
          return inv;
        }));
      }, 4200);
    }, 1500);
  };

  if (!user) {
    return (
      <div className="dashboard-loading">
        <span className="loader">Cargando consola...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <a href="/" className="nav-logo">
            <span className="logo-icon">X</span>
            <span className="logo-text">Tech</span>
          </a>
          <span className="badge-console">CONSOLA SaaS</span>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeMenu === 'resumen' ? 'active' : ''}`}
            onClick={() => setActiveMenu('resumen')}
          >
            📊 Resumen de Ahorro
          </button>
          <button 
            className={`menu-item ${activeMenu === 'kontai' ? 'active' : ''}`}
            onClick={() => setActiveMenu('kontai')}
          >
            📂 KontAI (Inbox Fiscal)
          </button>
          <button 
            className={`menu-item ${activeMenu === 'clinicnova' ? 'active' : ''}`}
            onClick={() => setActiveMenu('clinicnova')}
          >
            💬 ClinicNova (WhatsApp)
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-info">
            <div className="user-avatar">{user.name.charAt(0)}</div>
            <div className="user-text">
              <span className="user-name">{user.name}</span>
              <span className="user-company">{user.company}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-main">
        {/* TOP BAR */}
        <header className="dashboard-topbar">
          <h2>Consola de Control del Cliente</h2>
          <div className="system-health">
            <span className="health-dot"></span>
            <span>Servicios de automatización: Activos</span>
          </div>
        </header>

        {/* CONTENIDO INTERNO SEGÚN TABS */}
        <div className="dashboard-content">
          
          {/* TAB 1: RESUMEN DE AHORRO */}
          {activeMenu === 'resumen' && (
            <div className="dashboard-tab-content">
              <div className="welcome-banner">
                <h3>Hola, {user.name} 👋</h3>
                <p>Aquí tienes el estado en tiempo real del retorno de inversión de tus automatizaciones.</p>
              </div>

              {/* KPI CARDS GRID */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Horas Manuales Liberadas</div>
                  <div className="kpi-value text-emerald">18.5h <span className="kpi-sub">este mes</span></div>
                  <p className="kpi-desc">Tiempo acumulado que antes se dedicaba a facturación y recordatorios.</p>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Facturas Procesadas con IA</div>
                  <div className="kpi-value text-cyan">4 / 4</div>
                  <p className="kpi-desc">100% de éxito en lectura inteligente automatizada con IA sin intervención humana.</p>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">ROI Acumulado Estimado</div>
                  <div className="kpi-value text-rose">462,50 €</div>
                  <p className="kpi-desc">Ahorro financiero directo basado en tu coste/hora registrado.</p>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="dash-section">
                <h4>Actividad Operativa Reciente</h4>
                <div className="activity-timeline">
                  <div className="activity-item">
                    <span className="act-time">Hoy 15:42</span>
                    <p>🤖 <strong>KontAI</strong>: Factura leída de AWS. Extraído Base: 142.50€ / IVA: 29.93€, inyectada en Holded.</p>
                  </div>
                  <div className="activity-item">
                    <span className="act-time">Ayer 10:15</span>
                    <p>💬 <strong>ClinicNova</strong>: Recordatorio de cita por WhatsApp enviado a María Castillo (Confirmado por el usuario).</p>
                  </div>
                  <div className="activity-item">
                    <span className="act-time">05/07/2026</span>
                    <p>🛠️ <strong>CTO Externo</strong>: Configuración inicial de la integración del sistema de reservas completada con éxito.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KONTAI (INBOX FISCAL) */}
          {activeMenu === 'kontai' && (
            <div className="dashboard-tab-content">
              <div className="welcome-banner">
                <h3>📂 KontAI — Inbox Fiscal Inteligente</h3>
                <p>Tus facturas de gastos procesadas automáticamente mediante Visión por IA cognitiva.</p>
              </div>

              {/* UPLOAD FORM */}
              <div className="invoice-upload-box">
                <h4>Procesar nueva factura al instante</h4>
                <p>Sube un archivo PDF o imagen de factura. La IA extraerá los datos y la registrará en tu ERP en 4 segundos.</p>
                <form onSubmit={handleInvoiceUpload} className="upload-form">
                  <input 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg"
                    required
                    onChange={(e) => setNewInvoiceFile(e.target.files[0])}
                    className="file-input"
                  />
                  <button type="submit" className="btn-primary" disabled={uploading}>
                    <span>{uploading ? 'Procesando...' : 'Subir Factura'}</span>
                  </button>
                </form>
                {uploadMessage && <p className="upload-progress-text">{uploadMessage}</p>}
              </div>

              {/* INVOICES TABLE */}
              <div className="dash-section">
                <h4>Historial de Facturas Procesadas</h4>
                <div className="table-responsive">
                  <table className="invoices-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Emisor</th>
                        <th>NIF/CIF</th>
                        <th>Base Imponible</th>
                        <th>IVA/Tax</th>
                        <th>Estado</th>
                        <th>ERP Sincronizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td>{inv.date}</td>
                          <td><strong>{inv.emisor}</strong></td>
                          <td><code>{inv.nif}</code></td>
                          <td>{inv.base > 0 ? `${inv.base.toFixed(2)} €` : '-'}</td>
                          <td>{inv.tax > 0 ? `${inv.tax.toFixed(2)} €` : '-'}</td>
                          <td>
                            <span className={`status-badge ${inv.status}`}>
                              {inv.status === 'procesada' ? 'Completado' : inv.status === 'pendiente' ? 'Pendiente' : 'IA Leyendo...'}
                            </span>
                          </td>
                          <td>{inv.erp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLINICNOVA */}
          {activeMenu === 'clinicnova' && (
            <div className="dashboard-tab-content">
              <div className="welcome-banner">
                <h3>💬 ClinicNova — Control de WhatsApp & Citas</h3>
                <p>Monitorea y configura los recordatorios de WhatsApp automáticos enviados a tus pacientes.</p>
              </div>

              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Mensajes Enviados</div>
                  <div className="kpi-value text-violet">48</div>
                  <p className="kpi-desc">Total de recordatorios enviados por WhatsApp Business API.</p>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Tasa de Confirmación Activa</div>
                  <div className="kpi-value text-emerald">87.5%</div>
                  <p className="kpi-desc">Pacientes que confirman o reagendan pulsando los botones de WhatsApp.</p>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Ausencias Evitadas</div>
                  <div className="kpi-value text-rose">12 citas</div>
                  <p className="kpi-desc">Ausencias críticas evitadas que liberaron el slot a la lista de espera.</p>
                </div>
              </div>

              <div className="dash-section">
                <h4>Configuración de la Integración</h4>
                <div className="integration-status-card">
                  <div className="status-row">
                    <span>Estado WhatsApp Business API:</span>
                    <strong className="text-emerald">✓ CONECTADO</strong>
                  </div>
                  <div className="status-row">
                    <span>Sincronización del Calendario:</span>
                    <strong className="text-emerald">✓ ACTIVA</strong>
                  </div>
                  <div className="status-row">
                    <span>Servicio de Integración y Flujo:</span>
                    <strong className="text-emerald">✓ CONECTADO</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
