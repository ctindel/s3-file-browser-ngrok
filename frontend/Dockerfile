FROM node:14

WORKDIR /app

COPY package.json .
COPY public/env.prod.js public/env.js

RUN npm install

COPY . .

CMD ["npm", "start"]
