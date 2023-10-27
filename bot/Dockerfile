FROM node:20-alpine as node
WORKDIR /app

COPY .. ./

RUN npm install
RUN chmod +x ./entrypoint.sh
CMD ["./entrypoint.sh"]