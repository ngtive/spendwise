FROM node:20 as node
WORKDIR /app

COPY ./ ./
RUN npm install
RUN npm run migrate
CMD ["npm", "run", "start"]