FROM node:14

WORKDIR /app

COPY package.json .

RUN apt-get update && apt-get install -y vim

RUN npm install

COPY . .

CMD ["npm", "start"]
