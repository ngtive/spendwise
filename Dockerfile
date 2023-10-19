FROM node:20 as node

ENV DATABASE_URL=""
ENV REDIS_URL=""
ENV TELEGRAM_BOT_TOKEN=""
ENV TELEGRAM_BOT_USERNAME=""
ENV NODE_ENV="development"
ENV ADMIN_TELEGRAM_ID=""
WORKDIR /app

COPY ./ ./
RUN npm install
RUN npm run migrate
CMD ["npm", "run", "start"]