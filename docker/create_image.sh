#!/bin/sh
ARG="$1"
if [ "$ARG" = "backend"]; then
    docker build -f openvidu-call-polls-backend.Dockerfile -t openvidu-call-polls ..
else
    if [ "$ARG" != "no-sync" ]; then
        ARG="sync"
    fi
    docker build -f Dockerfile --build-arg POLLS_SYNC_MODE=$ARG -t openvidu-call-polls ..
fi