FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY server.js ./
COPY public ./public
COPY config.yml* ./
EXPOSE 3001
CMD ["node", "server.js"]
