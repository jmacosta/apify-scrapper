# Usar imagen base oficial de Node (ligera y compatible con Playwright)
FROM node:20-slim

# Crear usuario no root
RUN useradd -m myuser

# Crear directorio de trabajo dentro del home del usuario
WORKDIR /home/myuser/app

# Copiar archivos package.json y package-lock.json con permisos correctos
COPY package*.json ./

# Cambiar propietario de los archivos al usuario
RUN chown -R myuser:myuser /home/myuser/app

# Cambiar a usuario no root
USER myuser

# Instalar dependencias npm
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Instalar navegadores Playwright
RUN npx playwright install

# Comando para ejecutar la aplicación
CMD ["node", "src/main.js"]
