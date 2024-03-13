# Используйте официальный образ Node.js в качестве базового образа
FROM node:16 AS build

# Установите рабочую директорию для нашего приложения
WORKDIR /app

# Копируйте package.json и package-lock.json (или yarn.lock)
COPY package*.json ./

# Установите зависимости
RUN npm install

# Копировать исходный код проекта в рабочую директорию образа
COPY . .

# Установите пакет quasar глобально
RUN npm install -g @quasar/cli

# Соберите проект Vue интерфейса
RUN quasar build

# Настройка финального образа
FROM nginx:alpine

COPY --from=build /app/dist/spa /usr/share/nginx/html

# Здесь вы установили порт 9000, но NGINX по умолчанию слушает порт 80.
# Чтобы NGINX слушал порт 9000, вам также нужно изменить конфигурацию NGINX.
EXPOSE 9000

# Добавьте настройку NGINX для прослушивания на порту 9000
RUN echo "server { listen 9000; root /usr/share/nginx/html; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
