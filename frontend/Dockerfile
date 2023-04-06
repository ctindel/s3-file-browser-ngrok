FROM node:14

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN echo -e '\
window.env = {
  API_URL: \'https://s3-file-browser-frontend.ngrok.io\'',
  API_PORT: '443',
};
> public/env.js

CMD ["npm", "start"]
