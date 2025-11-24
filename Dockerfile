# Официальный Node.js
FROM node:18

# Рабочая директория
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем остальной код
COPY . .

# Переменная окружения (Railway сам её подставит)
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# Запускаем сервер
CMD ["node", "server.js"]
