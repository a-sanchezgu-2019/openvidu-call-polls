FROM node:18-alpine

WORKDIR /usr/share/openvidu-call-polls/frontend

RUN npm install -g @angular/cli@14.2.8
COPY src /usr/share/openvidu-call-polls/frontend/src
COPY angular.json /usr/share/openvidu-call-polls/frontend/angular.json
COPY package*.json /usr/share/openvidu-call-polls/frontend/
COPY tsconfig.json /usr/share/openvidu-call-polls/frontend/tsconfig.json
RUN cp src/proxy.conf.docker.json src/proxy.conf.json
RUN npm install

EXPOSE 4200
CMD ["ng", "serve", "--configuration=docker"]
