#!/bin/sh
if [ "$1" = "backend" ]; then
    docker build -f openvidu-call-polls-backend.Dockerfile -t openvidu-call-polls ..
else
    docker build -f Dockerfile -t openvidu-call-polls ..
fi