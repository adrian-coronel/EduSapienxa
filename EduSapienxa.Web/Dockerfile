# ═══════════════════════════════════════════════════════════
# ETAPA 1 — BUILD
# Node para instalar dependencias y compilar Angular + Tailwind
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS build
WORKDIR /app

# Copiar package.json primero para cachear node_modules.
# Si package.json no cambia, Docker reutiliza esta capa
# sin volver a descargar los 500MB+ de node_modules.
COPY package*.json ./
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# El script de build hace dos cosas:
# 1. Tailwind CLI compila y minifica los estilos
# 2. ng build compila Angular en modo producción
RUN npm run build --configuration production

# ═══════════════════════════════════════════════════════════
# ETAPA 2 — SERVE
# Nginx sirve los estáticos. Solo pesa ~25MB.
# Node, node_modules y código fuente NO llegan aquí.
# ═══════════════════════════════════════════════════════════
FROM nginx:alpine AS final

# Angular 17+ con @angular/build:application genera el output en:
# dist/EduSapienxa.Web/browser/
COPY --from=build /app/dist/EduSapienxa.Web/browser /usr/share/nginx/html

# Config personalizada obligatoria para Angular Router.
# Sin esto, cualquier ruta que no sea / devuelve 404 al refrescar.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx en foreground — si corre como daemon el contenedor muere inmediatamente
CMD ["nginx", "-g", "daemon off;"]