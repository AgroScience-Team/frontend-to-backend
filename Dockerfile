
   # Используйте официальный образ Node.js в качестве базового образа
   FROM node:16 as build

   # Установите рабочую директорию для нашего приложения
   WORKDIR /app

   # Копируйте package.json и package-lock.json (или yarn.lock)
   COPY package*.json ./

   # Установите зависимости
   RUN npm install

   # Копировать исходный код проекта в рабочую директорию образа
   COPY . .

   # Установите пакет `quasar` глобально
   RUN npm install -g @quasar/cli

   # Соберите проект Vue интерфейса
   RUN quasar build

   # Укажите порт, который будет прослушиваться в контейнере Docker
   EXPOSE 5000

   # Запустите сервер раздачи статических файлов для вашего приложения
   CMD ["quasar", "dev"]
