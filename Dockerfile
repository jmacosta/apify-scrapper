# Usamos una imagen base de Apify con Node.js y Playwright
FROM apify/actor-node-playwright-chrome:latest

# Cambiamos a root para instalar dependencias del sistema
USER root

# Instalar librerías del sistema necesarias para Chromium/Playwright
RUN apt-get update && \
    apt-get install -y \
        libglib2.0-0 \
        libglib2.0-bin \
        libnspr4 \
        libnss3 \
        libdbus-1-3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libexpat1 \
        libatspi2.0-0 \
        libx11-6 \
        libxcomposite1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libxcb1 \
        libxkbcommon0 \
        libasound2 \
        --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar los package.json con permisos correctos
COPY --chown=myuser:myuser package*.json ./

# Instalar dependencias de Node.js con permisos elevados
RUN npm install --unsafe-perm=true

# Copiar el resto del código con permisos adecuados
COPY --chown=myuser:myuser . .

# Instalar navegadores necesarios para Playwright
RUN npx playwright install

# Volver a usuario no root
USER myuser

# Comando para ejecutar la aplicación
CMD ["node", "src/main.js"]
