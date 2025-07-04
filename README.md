# OpenVidu Call Polls

[OpenVidu Call](https://github.com/openvidu/openvidu-call) based application with an implemented poll system.
Depends on [OpenVidu](https://openvidu.io) technologies. Learn more about it [here](https://docs.openvidu.io/en/stable/), you can deploy your own OpenVidu server following [this tutorial](https://docs.openvidu.io/en/stable/deployment/).

You can clone this repository by running the following command:
```sh
git clone https://github.com/a-sanchezgu-2019/openvidu-call-polls.git
```

After this, you can move to the root directory of the project with:
```sh
cd openvidu-call-polls
```

## Table of contents
* [Build & Deploy Instructions](#build--deploy-instructions)
  + [Docker Compose](#docker-compose).
  + [Docker Image](#docker-image).
  + [Build from Source](#build-from-source).


## Build & Deploy Instructions

This section will explain how to build the application and how you could deploy it.

As explained in the [OpenVidu Call documentation](https://docs.openvidu.io/en/stable/components/openvidu-call/#configuration-parameters-for-openvidu-call-backend) the backend uses these environment variables for its configuration:

| Environment Variable | Values | Description | Default Value | Notes |
|:---------------------|:-------|:------------|:--------------|:------|
| `SERVER_PORT`        | `0 - 65535` | Number that indicates the port where http server will listen | `5000` | As explained [here](https://docs.openvidu.io/en/stable/deployment/ce/on-premises/#1-prerequisites) in the OpenVidu Documentation, avoid ports `80`, `443`, `3478`, `5442`, `5443`, `6379` and `8888` |
| `OPENVIDU_URL`       | String | The URL where OpenVidu Server will be reachable. | `http://localhost:4443` | |
| `OPENVIDU_SECRET`    | String | Secret used to connect to OpenVidu Server. | `MY_SECRET` | |
| `CALL_PRIVATE_ACCESS` | `ENABLED` or `DISABLED` | Whether to enable the authentication feature or not. | `ENABLED` | |
| `CALL_USER`          | String | Username used for login to the OpenVidu Call session. This property has effect only if is `CALL_PRIVATE_ACCESS=ENABLED` | `admin` | |
| `CALL_SECRET`        | String | Secret used for login to the OpenVidu Call session. This property has effect only if is `CALL_PRIVATE_ACCESS=ENABLED` | Same as `OPENVIDU_SECRET` | |
| `CALL_ADMIN_SECRET`  | String | Secret used for login to the OpenVidu Call admin dashboard. | Same as `OPENVIDU_SECRET` | |
| `CALL_RECORDING`     | `ENABLED` or `DISABLED` | Whether to enable the recording features or not. | `ENABLED` | |
| `CALL_BROADCAST`     | `ENABLED` or `DISABLED` | Whether to enable the broadcast features or not. | `ENABLED` | |

In order to configure your own OpenVidu deployment, see [this guide](https://docs.openvidu.io/en/stable/deployment/ce/on-premises/).

In addition, you can use the `OPENVIDU_CALL_POLLS_SYNC` variable to configure poll synchronization with the backend, which is enabled by default (value `ENABLED`). In order to disable it set `OPENVIDU_CALL_POLLS_SYNC` variable to `DISABLED`. However, disabling this system is not recommended, since it could lead to poll data synchronization problems derived from user connection problems, such as disconnections.

### Options

You can build this application with three methods:

* [Docker Compose](#docker-compose)
* [Docker Image](#docker-image)
* [Build from Source](#build-from-source)

Some of these options offer a direct deployment method. However, you may need to configure other things in order to serve the application, like the OpenVidu server. Each method has notes about what you are missing after following the given instructions.

### Docker Compose

This option offers a quick and direct method to start 2 docker containers with the OpenVidu server and the OpenVidu Call Polls application.


#### Requirements

> [!NOTE]
> If you want to use [Docker Desktop](https://docs.docker.com/desktop/), all of these requirements are included in it.

* [Docker Engine](https://docs.docker.com/engine/install/)
* [Docker Compose](https://docs.docker.com/compose/install/)

> Check the [Docker official page](https://docs.docker.com/) for more information about how it works and its configuration.

In order to run the application containers, move to the `docker` directory and execute the following command:
```sh
docker compose up
```

Whenever you want to stop and delete the containers, execute:
```sh
docker compose down
```

> [!NOTE]
> You can configure the system with the environment variables explained above. In order to do so, you can execute `docker compose` with the following structure:
> ```sh
> export <VAR1>=<VALUE1>
> export <VAR2>=<VALUE2>
> # ...
> docker compose up
> ```
> Alternatively, you can use the `env` command:
> ```sh
> env <VAR1>=<VALUE1> <VAR2>=<VALUE2> docker compose up
> ```
> Keep in mind that, with this method, `CALL_SECRET` and `CALL_ADMIN_SECRET` have the default value `MY_SECRET` and they don't use the value set in `OPENVIDU_SECRET`, so you would need to set them manually to change them.


### Docker Image

This method creates the application server container image for Docker. Keep in mind you would need to set up an OpenVidu server.

#### Requirements

> [!NOTE]
> If you want to use [Docker Desktop](https://docs.docker.com/desktop/), all of these requirements are included in it.

* [Docker Engine](https://docs.docker.com/engine/install/) (included in [Docker Desktop](https://docs.docker.com/desktop/))

> Check the [Docker official page](https://docs.docker.com/) for more information about how it works and its configuration.


You can quickly build the image of the server application container with the script `create_image.sh` by executing the following command from the `docker` directory of the project:
```sh
./create_image.sh
```
This would create a container image named `openvidu-call-polls`.

Alternatively, you can use directly the Dockerfile in order to choose the image name:
```sh
docker build -f Dockerfile -t <image-name> ..
```
Where `<image-name>` is the desired image name.

> [!NOTE]
> You can use environment variables to configure the backend execution as explained in the table above. You would probably need to set at least `OPENVIDU_URL` to `http://DOMAIN_OR_PUBLIC_IP:HTTP_PORT` or `https://DOMAIN_OR_PUBLIC_IP:HTTPS_PORT`, where `DOMAIN_OR_PUBLIC_IP`, `HTTP_PORT` and `HTTPS_PORT` are the values of these environment variables in the OpenVidu server. Also, you would probably need to set `OPENVIDU_SECRET` to the value of the same variable in the OpenVidu server. You would also need to map the port of the container to a port in your system with the `-p` (or `--port`) parameter.

In order to run the container, you should use `docker run`:
```sh
docker run -e OPENVIDU_URL=<openvidu-url> -e OPENVIDU_SECRET=<openvidu-secret> -p 5000:<system-port> <image-name>
```
Where `<openvidu-url>` and `<openvidu-secret>` are the values explained above and `<system-port>` is the desired port of the application in your system. The default port is port 5000, but it could be changed with the environment variable `SERVER_PORT`.

Alternatively, the environment variables could be established with an environment file. You can run the container using an environment file with the following command:
```sh
docker run --env-file <env-file-path> -p 5000:<system-port>
```
Where `<env-file-path>` is the path to the desired environment file.

### Build from Source

This method allows you to build the application from source. Keep in mind you would need to set up an OpenVidu server.

#### Requirements
* [Maven](https://maven.apache.org/), with a JDK
* [Angular CLI](https://angular.dev), with [Node](https://nodejs.org)

First, you need to build the frontend application. In order to install the dependencies, run the following command from the `openvidu-call-front` directory:
```sh
npm install # or npm i
```

Then, in order to build the application, execute the following command:
```sh
ng build
```

In order to serve the frontend with the backend application, move all the generated application files located in `openvidu-call-front/dist/openvidu-call` to `openvidu-call-back-java/src/main/resources/static`.
Then, in order to build the backend application change your working directory to `openvidu-call-back-java` and execute the following command:
```sh
mvn package
```

This will generate a `openvidu-call-back-java.jar` file in the `openvidu-call-back-java/target` directory. Place it wherever you want with any name you want and run it with:
```sh
java -jar <jar-file-path>
```

> [!NOTE]
> You can use environment variables to configure the backend execution as explained in the table above. You would probably need to set at least `OPENVIDU_URL` to `http://DOMAIN_OR_PUBLIC_IP:HTTP_PORT` or `https://DOMAIN_OR_PUBLIC_IP:HTTPS_PORT`, where `DOMAIN_OR_PUBLIC_IP`, `HTTP_PORT` and `HTTPS_PORT` are the values of these environment variables in the OpenVidu server. Also, you would probably need to set `OPENVIDU_SECRET` to the value of the same variable in the OpenVidu server.