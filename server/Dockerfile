FROM ghcr.io/puppeteer/puppeteer:25.12.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD [ "node", "dist/src/server.js" ]

