FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Ejecutamos vite en modo dev para que el puerto coincida y sea fácil de visualizar
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5000"]
