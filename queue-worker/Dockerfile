FROM node:20-alpine as node
WORKDIR /app

COPY ./ ./

ENV QUEUE_NAME = "bot-queue"
ENV TELEGRAM_TOKEN = ""
RUN npm install
CMD ["npm", "run", "start"]