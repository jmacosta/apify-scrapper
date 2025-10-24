FROM apify/actor-node-playwright-chrome:latest

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos con los permisos adecuados
COPY --chown=myuser:myuser package*.json ./

# Instalar dependencias con permisos elevados
RUN npm install --unsafe-perm=true

# Copiar el resto de los archivos
COPY --chown=myuser:myuser . ./

# Instalar los navegadores necesarios
RUN npx playwright install

# Establecer el usuario adecuado
USER myuser

# Comando para ejecutar la aplicación
CMD ["node", "src/main.js"]
