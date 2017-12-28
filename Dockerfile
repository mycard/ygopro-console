FROM node
RUN mkdir -p /usr/src/app /usr/src/app/express-server /usr/src/app/react-pages
# 设置时区
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 后端配备
WORKDIR /usr/src/app/express-server
COPY ./express-server/package.json /usr/src/app/express-server/package.json
COPY ./express-server/package-lock.json /usr/src/app/express-server/package-lock.json
RUN npm install

# 前端配备
WORKDIR /usr/src/app/react-pages
COPY ./react-pages/package.json /usr/src/app/react-pages/package.json
COPY ./react-pages/package-lock.json /usr/src/app/react-pages/package-lock.json
RUN npm install

# 文件
COPY ./express-server /usr/src/app/express-server
COPY ./react-pages /usr/src/app/react-pages

# 构建
RUN npm run build

WORKDIR /usr/src/app
RUN git submodule init && git submodule update
ENTRYPOINT ./express-server/node_modules/coffeescript/bin/coffee ./express-server/*.coffee && node express-server/server.js