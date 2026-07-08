import './globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Consultoría Tecnológica & Automatización IA para PYMEs | XTech Consultant',
  description: '¿Quieres optimizar tu empresa? XTech diseña y desarrolla automatizaciones de procesos con IA (n8n, Make), desarrollo de software a medida y dashboards de Big Data. ROI garantizado. Diagnóstico gratis.',
  keywords: 'consultoría tecnológica, automatización n8n, consultor supabase, desarrollo Next.js, integración HubSpot Salesforce, automatización IA PYMEs, Big Data business intelligence, desarrollo apps a medida, transformación digital, software a medida España, automatización empresas, desarrollo SaaS, inteligencia artificial negocios',
  authors: [{ name: 'XTech Consultant' }],
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  alternates: {
    canonical: 'https://www.xtechconsultant.com/',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.xtechconsultant.com/',
    title: 'XTech Consultant — Automatización IA & Consultoría Tecnológica para PYMEs',
    description: 'Tu competencia ya automatizó. Socios tecnológicos expertos en automatización de procesos con IA (n8n, Make), desarrollo de software a medida y dashboards de negocio. Diagnóstico gratis.',
    images: [
      {
        url: 'https://www.xtechconsultant.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XTech Consultant — Consultoría Tecnológica & Automatización IA para PYMEs',
      },
    ],
    siteName: 'XTech Consultant',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XTech Consultant — Automatización IA & Consultoría Tecnológica',
    description: 'Tu competencia ya automatizó. ¿Y tú? Diagnóstico gratuito de 1 hora para PYMEs. ROI en 60-90 días.',
    images: ['https://www.xtechconsultant.com/og-image.png'],
  },
  other: {
    'geo.region': 'ES-MU',
    'geo.placename': 'Murcia',
    'geo.position': '37.9922;-1.1307',
    ICBM: '37.9922, -1.1307',
    coverage: 'Worldwide',
    target: 'all',
  },
};

export default function RootLayout({ children }) {
  // LD+JSON Structured Data objects
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'XTech Consultant',
    'url': 'https://www.xtechconsultant.com',
    'logo': 'https://www.xtechconsultant.com/logo.svg',
    'description': 'Socios tecnológicos estratégicos para PYMEs. Automatización con IA, Big Data, desarrollo de apps a medida, CRM y Cloud. Servicio remoto global desde España.',
    'email': 'xtechconsultantit@gmail.com',
    'foundingDate': '2025',
    'numberOfEmployees': {
      '@type': 'QuantitativeValue',
      'minValue': 2,
      'maxValue': 10
    },
    'areaServed': [
      { '@type': 'Country', 'name': 'España' },
      { '@type': 'Country', 'name': 'México' },
      { '@type': 'Country', 'name': 'Colombia' },
      { '@type': 'Country', 'name': 'Argentina' },
      { '@type': 'Country', 'name': 'Chile' },
      { '@type': 'Country', 'name': 'Perú' },
      { '@type': 'Country', 'name': 'Estados Unidos' }
    ],
    'knowsAbout': [
      'Automatización con Inteligencia Artificial',
      'Big Data y Business Intelligence',
      'Desarrollo de aplicaciones web y móvil',
      'CRM y migraciones de sistemas',
      'Consultoría y auditoría tecnológica',
      'Pipelines de integración',
      'GPT-4',
      'Supabase',
      'Next.js',
      'n8n',
      'Make',
      'OpenAI API',
      'Salesforce',
      'HubSpot',
      'Automatización de facturas'
    ],
    'sameAs': [
      'https://www.linkedin.com/company/xtechconsultant'
    ]
  };

  const jsonLdLocal = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.xtechconsultant.com/#localbusiness',
    'name': 'XTech Consultant',
    'image': 'https://www.xtechconsultant.com/logo.svg',
    'url': 'https://www.xtechconsultant.com',
    'email': 'xtechconsultantit@gmail.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Plaza Circular',
      'addressLocality': 'Murcia',
      'addressRegion': 'Región de Murcia',
      'postalCode': '30008',
      'addressCountry': 'ES'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 37.9922,
      'longitude': -1.1307
    },
    'priceRange': '€€',
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      'opens': '09:00',
      'closes': '18:00'
    },
    'areaServed': [
      { '@type': 'City', 'name': 'Murcia' },
      { '@type': 'Country', 'name': 'España' },
      { '@type': 'Country', 'name': 'México' },
      { '@type': 'Country', 'name': 'Colombia' },
      { '@type': 'Country', 'name': 'Argentina' },
      { '@type': 'Country', 'name': 'Chile' }
    ]
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': '¿Trabajáis con cualquier tipo de empresa?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Trabajamos con empresas que ya facturan y tienen procesos que quieren optimizar. No necesitas ser grande — si pierdes más de 5 horas a la semana en tareas manuales, podemos ayudarte.'
        }
      },
      {
        '@type': 'Question',
        'name': '¿Cuánto cuesta una automatización real?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'La mayoría de proyectos arrancan desde 2.000€. Siempre presupuesto cerrado. Sin sorpresas. El ROI suele recuperarse en 60-90 días.'
        }
      },
      {
        '@type': 'Question',
        'name': '¿Qué pasa si ya tenemos herramientas contratadas?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Perfecto. Trabajamos con lo que ya tienes. Conectamos, automatizamos y potenciamos tus herramientas actuales — no te obligamos a cambiar de stack.'
        }
      },
      {
        '@type': 'Question',
        'name': '¿Necesitamos saber programar?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No. Todo tiene interfaz intuitiva. Incluimos formación y soporte para que tu equipo sea autónomo desde el día 1.'
        }
      },
      {
        '@type': 'Question',
        'name': '¿Ofrecéis soporte después de la entrega?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Sí. Soporte post-lanzamiento incluido. Planes de mantenimiento mensual disponibles para quienes quieren un partner técnico permanente.'
        }
      },
      {
        '@type': 'Question',
        'name': '¿Cuánto tardáis en tener algo funcionando?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '2-4 semanas la mayoría de automatizaciones. Proyectos más complejos se entregan en sprints quincenales — siempre ves avances reales, nunca promesas vacías.'
        }
      }
    ]
  };

  return (
    <html lang="es" className={`${inter.variable}`}>
      <head>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TW1QF26NPD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TW1QF26NPD');
          `}
        </Script>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocal) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body>
        <div className="ambient-glow" aria-hidden="true"></div>
        <div className="noise-overlay" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}
