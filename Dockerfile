# Usamos la imagen oficial de Apify con Node + Playwright
FROM apify/actor-node-playwright:latest

# Copiamos todo el proyecto
COPY . /usr/src/app

# Instalamos dependencias
RUN npm install

# Comando por defecto al ejecutar el actor
CMD ["node", "main.js"]
