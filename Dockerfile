FROM apify/actor-node-playwright-chrome:latest

# Crear directorio de trabajo y asignar permisos
RUN mkdir -p /app
WORKDIR /app
RUN chown -R node:node /app

# Cambiar al usuario node (apify images usan node como user no root)
USER node

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY --chown=node:node . .

# Comando por defecto
CMD ["node", "main.js"]
