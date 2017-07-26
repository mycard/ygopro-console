FROM node
RUN mkdir -p /usr/src/app /usr/src/app/express-server /usr/src/app/react-pages

WORKDIR /usr/src/app/express-server
COPY ./express-server/package.json /usr/src/app/express-server/package.json
COPY ./express-server/package-lock.json /usr/src/app/express-server/package-lock.json
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/react-pages
COPY ./react-pages/package.json /usr/src/app/react-pages/package.json
COPY ./react-pages/package-lock.json /usr/src/app/react-pages/package-lock.json
RUN npm install

WORKDIR /usr/src/app
COPY ./express-server /usr/src/app/express-server
COPY ./react-pages /usr/src/app/react-pages

ENTRYPOINT node express-server/server.js