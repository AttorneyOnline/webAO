# webAO

This is a client for the Attorney Online roleplaying chatroom written in HTML and JavaScript.
It works with the tsuserver3/serverD software when the server has WebSockets enabled.

webAO-only features:
 - Asset URLs
 - Automated testimony control

Desktop-only features:
 - 2.6+ markup
 - Non-interrupting preanimations

In short, webAO is in disrepair. Again.

Link to the client in this repo: http://web.aceattorneyonline.com/

# Project Setup
- Install [Node JS](https://nodejs.org/en/)
- Install nvm | [Windows](https://github.com/coreybutler/nvm-windows) , [Linux](https://github.com/nvm-sh/nvm)

# Running Locally on Windows
1. Look at the file version in `.nvmrc` and run `nvm use <VERSION NUMBER>`
2. `npm install`
3. `npm run start`


# Running Locally on Linux
1. `nvm use`
2. `npm install`
3. `npm run start`

# Running with Docker
`docker build -t webao .`
`docker run -d -it -p 8080:8080 webao`

