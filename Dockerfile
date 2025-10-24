FROM apify/actor-node-playwright-chrome:latest

# Instalar librerías necesarias para Playwright
USER root
RUN apt-get update && \
    apt-get install -y \
        libglib2.0-0 \
        libgobject-2.0-0 \
        libnspr4 \
        libnss3 \
        libnssutil3 \
        libdbus-1-3 \
        libgio2.0-0 \
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

# Copiar archivos con los permisos adecuados
COPY --chown=myuser:myuser package*.json ./
RUN npm install --unsafe-perm=true

# Copiar el resto de los archivos
COPY --chown=myuser:myuser . ./

# Instalar navegadores necesarios
RUN npx playwright install

# Establecer usuario
USER myuser

# Ejecutar la aplicación
CMD ["node", "src/main.js"]
