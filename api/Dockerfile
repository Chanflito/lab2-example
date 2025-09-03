FROM node:20-alpine3.17

WORKDIR /app

COPY package*.json .
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD npm run start:prod