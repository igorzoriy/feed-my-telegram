FROM node:10

WORKDIR /home/node/app
COPY . .
RUN rm -rf node_modules
RUN rm storage.sqlite
RUN rm .env
RUN mv .env.prod .env
RUN npm install

CMD ["npm", "start"]
