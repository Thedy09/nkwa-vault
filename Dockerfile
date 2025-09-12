# Dockerfile pour Nkwa Vault
# Multi-stage build pour optimiser la taille de l'image

# Stage 1: Build du frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de dépendances
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY frontend/ ./

# Build de production
RUN npm run build

# Stage 2: Build du backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copier les fichiers de dépendances
COPY backend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY backend/ ./

# Stage 3: Image de production
FROM node:18-alpine AS production

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nkwa -u 1001

# Créer les répertoires
WORKDIR /app
RUN mkdir -p logs uploads

# Copier le backend depuis le stage de build
COPY --from=backend-builder /app/backend ./backend

# Copier le frontend buildé
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Copier les scripts de déploiement
COPY scripts/ ./scripts/

# Changer les permissions
RUN chown -R nkwa:nodejs /app
RUN chmod +x scripts/*.sh

# Passer à l'utilisateur non-root
USER nkwa

# Exposer le port
EXPOSE 4000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Démarrer l'application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/src/server.js"]


