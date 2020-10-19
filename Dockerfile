FROM node:12

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV PORT=3000

EXPOSE 3000

RUN chmod u+x ./docker-start.sh

CMD ./docker-start.sh