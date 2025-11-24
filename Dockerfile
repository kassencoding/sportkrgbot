# Официальный Node.js
FROM node:18

# Рабочая директория
WORKDIR /app

# Устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем остальной код
COPY . .

# Запускаем сервер
CMD ["node", "server.js"]
