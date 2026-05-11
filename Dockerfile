# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Устанавливаем плейсхолдер для переменной окружения на этапе сборки.
# Vite заменит 'process.env.GEMINI_API_KEY' на этот плейсхолдер в скомпилированном коде.
ENV GEMINI_API_KEY=__VITE_GEMINI_API_KEY_PLACEHOLDER__

# Собираем production-версию
RUN npm run build

# Этап 2: Раздача статики через Nginx
FROM nginx:alpine

# Копируем собранные файлы из первого этапа
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем скрипт точки входа
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Настраиваем Nginx для работы с SPA (fallback на index.html)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
