# rpa-channel

## Introduction

The channel will handle the conversation

RegisterParty:
SomeGuyNamedJoe: (endpoint to listen)

RegisterParty:
DominosPizza: (endpoint to listen)


OpenConversation ("DominosPizza", AudioStream)

Handles the cycle: listen -> brain -> speak

listen: curl -v http://20.20.20.20:8080/tracks -X POST -F name=abc -F track=@sample.pcm -F encoding=LINEAR16
brain: curl -XPOST http://localhost:5005/conversations/default/respond -d '{"query":"hello"}'
speak: http://20.20.20.20:5050/read?voiceId=Amy&text=Thank%20you%20sir&outputFormat=pcm
--> stream speech to a registered endpoint listener


## Getting Started

docker build --tag rpa-channel .



export INPUT_SOURCE=http://20.20.20.20:5050

export FORWARD=http://20.20.20.20:8080/tracks


# Docker Setup

docker build -t rpa-channel .

docker run $MODE -e INPUT_SOURCE -e FORWARD -p 7080:80 -p 7777:7777 \
-e DATABASE_HOST=20.20.20.20 \
-e DATABASE_PORT=27017 \
-e DATABASE_DBNAME=rpa \
-e DATABASE_USERNAME=rpatmp \
-e DATABASE_PASSWORD=rpatmp \
--name rpa-channel rpa-channel


curl -v http://20.20.20.20:7080/bridge -X POST -d text="I want to order a pizza" -d voiceId=Amy

curl -v http://20.20.20.20:7080/v1/conversations


## Create user

db.createUser(
    {
        user: "rpatmp",
        pwd: "rpatmp",
        roles: [ "readWrite" ]
    }
);
