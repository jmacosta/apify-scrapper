# Usamos la imagen con Node.js y Playwright Chromium ya preinstalado
FROM ghcr.io/apify/actor-node-playwright:latest


# Directorio de trabajo
WORKDIR /app

# Copiamos package.json y package-lock.json primero para cachear dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Instalamos dependencias de Playwright y navegadores
RUN npx playwright install --with-deps

# Comando para ejecutar tu actor
CMD ["node", "main.js"]
