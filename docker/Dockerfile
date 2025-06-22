# Build Frontend
FROM node:18-alpine AS front_build

WORKDIR /usr/share/openvidu-call-polls-front

RUN npm install -g @angular/cli@14.2.8
COPY openvidu-call-front/src /usr/share/openvidu-call-polls-front/src
COPY openvidu-call-front/angular.json /usr/share/openvidu-call-polls-front/angular.json
COPY openvidu-call-front/package*.json /usr/share/openvidu-call-polls-front/
COPY openvidu-call-front/tsconfig.json /usr/share/openvidu-call-polls-front/tsconfig.json
RUN npm install
RUN ng build --base-href="/" --configuration=docker

# Build Backend
FROM maven:3.8.4-openjdk-17 AS back_build

WORKDIR /usr/share/openvidu-call-polls-back
COPY openvidu-call-back-java/pom.xml /usr/share/openvidu-call-polls-back/pom.xml
RUN mvn clean && mvn -B -f pom.xml dependency:resolve
COPY openvidu-call-back-java/src /usr/share/openvidu-call-polls-back/src
COPY --from=front_build /usr/share/openvidu-call-polls-front/dist/openvidu-call/* /usr/share/openvidu-call-polls-back/src/main/resources/static/
ENV SERVER_PORT=5442
RUN mvn package

# Run Packed App
FROM eclipse-temurin:17-jre-alpine

WORKDIR /usr/share/openvidu-call-polls
COPY --from=back_build /usr/share/openvidu-call-polls-back/target/openvidu-call-back-java.jar /usr/share/openvidu-call-polls/openvidu-call-polls.jar
EXPOSE 5442

CMD ["java", "-jar", "openvidu-call-polls.jar"]