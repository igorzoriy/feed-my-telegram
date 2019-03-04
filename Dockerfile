FROM node:10

WORKDIR /app

COPY ./.env.defaults /app

COPY ./package.json /app
COPY ./package-lock.json /app
COPY ./tsconfig.json /app
COPY ./src /app/src
COPY ./typings /app/typings

RUN npm install

CMD ["npm", "start"]
