FROM node:14

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN echo "window.env = {" > public/env.js &&  \
  echo "  API_URL: 'https://s3-file-browser-backend.ngrok.io'," >> public/env.js && \
  echo "  API_PORT: '443'" >> public/env.js && \
  echo "};" >> public/env.js

CMD ["npm", "start"]
