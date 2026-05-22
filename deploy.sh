#!/bin/bash
# ═══════════════════════════════════════════════════════
# XTech Consultant — Quick Deployment Script
# Syncs code with GitHub and deploys directly to Vercel.
# ═══════════════════════════════════════════════════════

echo "🚀 Iniciando despliegue de XTech Consultant (Light Mode)..."

# 1. Picar a GitHub
echo "📦 Subiendo cambios a GitHub (Rama: main)..."
git push origin main

# 2. Desplegar en producción en Vercel
echo "⚡ Desplegando en producción en Vercel..."
npx vercel --prod --yes

echo "✅ ¡Listo! La web se ha actualizado con éxito."
