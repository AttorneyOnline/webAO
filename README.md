# webAO

This is a client for the Attorney Online roleplaying chatroom written in HTML and JavaScript.
It works with any AO server if it has WebSocket support.

Link to the client in this repo: <http://web.aceattorneyonline.com/>

## Project Setup

- Install [Bun](https://bun.com/)

## Running Locally

1. `bun install`
2. `bun run start`

## Running with Docker

`docker build -t webao .`
`docker run -d -it -p 8080:8080 webao`
