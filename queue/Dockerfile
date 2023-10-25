FROM node:20-alpine as node
WORKDIR /app

COPY ./ ./

RUN npm install
CMD ["npm", "run", "start"]