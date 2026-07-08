'use client';

import React, { useState, useEffect, useMemo } from 'react';

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const workingHours = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00'
];

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

export default function BookingCalendar() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Rango de 12 días laborables válidos
  const daysToRender = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const today = new Date();
    let dayCounter = 0;
    let checkDate = new Date(today);
    // Empezar mañana para evitar reservas en el mismo día
    checkDate.setDate(checkDate.getDate() + 1);

    const list = [];
    while (dayCounter < 12) {
      const dayOfWeek = checkDate.getDay();
      // Bloquear fines de semana (0 = Domingo, 6 = Sábado)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        list.push(new Date(checkDate));
        dayCounter++;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    return list;
  }, []);

  // Mes/año de visualización del calendario
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.getFullYear();
  });

  // Slots ocupados en la fecha seleccionada
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [revenue, setRevenue] = useState('');
  const [bottleneck, setBottleneck] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar mes/año inicial al primer día válido
  useEffect(() => {
    if (daysToRender.length > 0) {
      setCurrentMonth(daysToRender[0].getMonth());
      setCurrentYear(daysToRender[0].getFullYear());
    }
  }, [daysToRender]);

  // Cargar slots ocupados cuando cambie el día seleccionado
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Llamar a nuestro API backend segura
        const res = await fetch(`/api/slots?date=${formattedDate}`);
        if (res.ok) {
          const slots = await res.json();
          setBookedSlots(slots || []);
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.error('Error cargando slots ocupados:', err);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  // Navegación de meses
  const changeMonth = (dir) => {
    let newMonth = currentMonth + dir;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    // No permitir ir antes del mes actual
    if (newYear < todayYear || (newYear === todayYear && newMonth < todayMonth)) {
      return;
    }
    
    // No permitir ir más allá del mes con el último día disponible
    if (daysToRender.length > 0) {
      const maxDate = daysToRender[daysToRender.length - 1];
      const maxMonth = maxDate.getMonth();
      const maxYear = maxDate.getFullYear();
      if (newYear > maxYear || (newYear === maxYear && newMonth > maxMonth)) {
        return;
      }
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Deshabilitar botones de navegación de mes
  const isPrevDisabled = useMemo(() => {
    const today = new Date();
    return currentYear === today.getFullYear() && currentMonth === today.getMonth();
  }, [currentMonth, currentYear]);

  const isNextDisabled = useMemo(() => {
    if (daysToRender.length === 0) return true;
    const maxDate = daysToRender[daysToRender.length - 1];
    return currentYear === maxDate.getFullYear() && currentMonth === maxDate.getMonth();
  }, [currentMonth, currentYear, daysToRender]);

  // Renderizar las celdas del mes
  const calendarCells = useMemo(() => {
    const cells = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDayIndex = (firstDay.getDay() + 6) % 7; // Lunes = 0, ..., Domingo = 6
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Spacers iniciales
    for (let i = 0; i < startDayIndex; i++) {
      cells.push({ type: 'spacer', key: `spacer-${i}` });
    }

    // Días reales
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isAvailable = daysToRender.some(d => isSameDay(d, date));
      cells.push({
        type: 'day',
        key: `day-${day}`,
        day,
        date,
        isAvailable,
        isToday: isSameDay(date, today),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      });
    }

    return cells;
  }, [currentMonth, currentYear, daysToRender, selectedDate]);

  // Manejar el submit de la reserva
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setIsSubmitting(true);

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;

    // Payload de envío seguro
    const payload = {
      dateFormatted: formattedDate,
      slot: selectedSlot,
      name,
      email,
      company,
      revenue,
      bottleneck,
      submittedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStep(3);
      } else {
        alert('Hubo un error al registrar la cita. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error enviando reserva:', err);
      alert('Error de red al procesar tu cita. Reintente por favor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedSlot(null);
    setName('');
    setEmail('');
    setCompany('');
    setRevenue('');
    setBottleneck('');
    if (daysToRender.length > 0) {
      setCurrentMonth(daysToRender[0].getMonth());
      setCurrentYear(daysToRender[0].getFullYear());
    }
    setStep(1);
  };

  if (!mounted) {
    return <div className="booking-card" style={{ minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader" style={{ color: 'var(--accent)', fontWeight: 500 }}>Cargando calendario...</span></div>;
  }

  return (
    <div className="booking-card">
      {/* Progress Bar */}
      <div className="booking-progress">
        <div 
          className="bp-bar" 
          style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
        ></div>
      </div>

      {/* STEP 1: SELECT DAY AND SLOT */}
      {step === 1 && (
        <div className="booking-step active">
          <h3 className="booking-step-title">1. Selecciona Fecha y Hora</h3>
          <p className="booking-step-desc">Elige un día laboral y tu hora preferida para la llamada de 1 hora.</p>
          
          {/* Calendario Reactivo */}
          <div className="booking-calendar-wrapper">
            <div className="calendar-header">
              <button 
                type="button" 
                className="calendar-nav-btn" 
                onClick={() => changeMonth(-1)}
                disabled={isPrevDisabled}
                aria-label="Mes anterior"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="calendar-month-year">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button 
                type="button" 
                className="calendar-nav-btn" 
                onClick={() => changeMonth(1)}
                disabled={isNextDisabled}
                aria-label="Mes siguiente"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="calendar-weekdays">
              <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
            </div>
            <div className="calendar-days">
              {calendarCells.map((cell) => {
                if (cell.type === 'spacer') {
                  return <div key={cell.key} className="calendar-spacer" />;
                }
                
                return (
                  <button
                    key={cell.key}
                    type="button"
                    className={`calendar-day ${cell.isAvailable ? '' : 'disabled'} ${cell.isSelected ? 'selected' : ''} ${cell.isToday ? 'today' : ''}`}
                    disabled={!cell.isAvailable}
                    onClick={() => {
                      setSelectedDate(cell.date);
                      setSelectedSlot(null); // Resetear slot
                    }}
                    title={`${dayNames[cell.date.getDay()]} ${cell.day} de ${monthNames[cell.date.getMonth()]}`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Horas */}
          {selectedDate && (
            <div className="booking-slots-container" style={{ display: 'block' }}>
              <h4 className="slots-header">
                Horas disponibles para el{' '}
                <span>
                  {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
                </span>
                :
              </h4>

              {loadingSlots ? (
                <div className="slots-skeleton-loader">Cargando horas libres...</div>
              ) : (
                <div className="slots-grid">
                  {workingHours.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`slot-btn ${isBooked ? 'booked' : ''} ${selectedSlot === slot ? 'active' : ''}`}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.split(' - ')[0]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="booking-actions">
            <button 
              type="button" 
              className={`btn-primary btn-full ${(!selectedDate || !selectedSlot) ? 'disabled' : ''}`} 
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep(2)}
            >
              <span>Continuar al Registro</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: QUALIFY FORM */}
      {step === 2 && (
        <div className="booking-step active">
          <h3 className="booking-step-title">2. Detalles de la Reunión</h3>
          <p className="booking-step-desc">Cuéntanos sobre tu negocio para preparar un diagnóstico preciso.</p>
          
          <form onSubmit={handleBookingSubmit} className="booking-form-element">
            <div className="booking-field-row">
              <div className="booking-field">
                <label htmlFor="b-name">Tu nombre completo</label>
                <input 
                  type="text" 
                  id="b-name" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza" 
                />
              </div>
              <div className="booking-field">
                <label htmlFor="b-email">Email corporativo</label>
                <input 
                  type="email" 
                  id="b-email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@empresa.com" 
                />
              </div>
            </div>

            <div className="booking-field-row">
              <div className="booking-field">
                <label htmlFor="b-company">Nombre de tu empresa</label>
                <input 
                  type="text" 
                  id="b-company" 
                  required 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ej. Nova S.L." 
                />
              </div>
              <div className="booking-field">
                <label htmlFor="b-revenue">Facturación estimada</label>
                <select 
                  id="b-revenue" 
                  required
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                >
                  <option value="" disabled>Selecciona un rango...</option>
                  <option value="<100k">Menos de 100k€ / año</option>
                  <option value="100k-500k">100k€ - 500k€ / año</option>
                  <option value="500k-2M">500k€ - 2M€ / año</option>
                  <option value=">2M">Más de 2M€ / año</option>
                </select>
              </div>
            </div>

            <div className="booking-field">
              <label htmlFor="b-bottleneck">¿Cuál es tu mayor cuello de botella o tarea repetitiva hoy?</label>
              <textarea 
                id="b-bottleneck" 
                rows="3" 
                required 
                value={bottleneck}
                onChange={(e) => setBottleneck(e.target.value)}
                placeholder="Ej. Perdemos 10 horas semanales clasificando correos de facturas y cargando datos a mano..."
              />
            </div>

            <div className="booking-actions multi-actions">
              <button 
                type="button" 
                className="btn-cb btn-cb-ghost" 
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                <span>Atrás</span>
              </button>
              <button 
                type="submit" 
                className={`btn-primary btn-flex ${isSubmitting ? 'disabled' : ''}`}
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Agendando...' : 'Confirmar Cita de 1h'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: SUCCESS ANIMATION */}
      {step === 3 && (
        <div className="booking-step active">
          <div className="booking-success-wrapper">
            <div className="success-icon-ring">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" className="success-checkmark">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="booking-step-title text-center">¡Cita Solicitada con Éxito!</h3>
            <p className="booking-step-desc text-center">
              Hemos agendado tu sesión de diagnóstico para el <br />
              <strong className="text-gradient">
                {selectedDate?.getDate()} de {monthNames[selectedDate?.getMonth()]} a las {selectedSlot?.split(' - ')[0]}
              </strong>.
            </p>
            <div className="success-details-card">
              <p>📩 Te hemos enviado un correo electrónico de confirmación con la invitación de Google Meet y los detalles de la agenda.</p>
              <p>👤 Si es necesario, nos pondremos en contacto contigo previamente para solicitar alguna aclaración adicional sobre tu caso.</p>
            </div>
            <div className="booking-actions">
              <button type="button" className="btn-primary btn-full" onClick={handleReset}>
                <span>Reservar otra llamada</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
