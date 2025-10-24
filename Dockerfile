FROM apify/actor-node-playwright-chrome:latest

# Directorio de trabajo dentro del home del usuario node
WORKDIR /home/node/app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias como node
RUN npm install

# Copiar el resto del código
COPY --chown=node:node . .

# Comando por defecto
CMD ["node", "main.js"]
