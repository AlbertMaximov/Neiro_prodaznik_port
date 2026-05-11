#!/bin/sh

# Проверяем наличие ключа, но не блокируем запуск (чтобы можно было отладить в браузере, если нужно)
if [ -z "$GEMINI_API_KEY" ]; then
    echo "WARNING: GEMINI_API_KEY environment variable is not set."
fi

# Ищем все JS файлы в директории сборки и заменяем плейсхолдер на реальное значение 
# переменной окружения $GEMINI_API_KEY, переданной при старте контейнера
find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s|__VITE_GEMINI_API_KEY_PLACEHOLDER__|${GEMINI_API_KEY}|g" {} +

# Выполняем основную команду (запуск nginx)
exec "$@"
