# webAO

This is a client for the Attorney Online roleplaying chatroom written in HTML and JavaScript. It works with any AO server if it has WebSocket support.

**Live Client:** [https://webao.miku.pizza/](https://webao.miku.pizza/)

## Project Setup

### Prerequisites

- [Bun](https://bun.sh) (JavaScript runtime)
- Git
- Node.js (optional, for Docker)

### Running Locally with Bun

```bash
# Clone the repository
git clone https://github.com/SyntaxNyah/webAO.git
cd webAO

# Install dependencies
bun install

# Build the project
bun run build

# Start the development server
bun run start

### Running with Docker

`docker build -t webao .`
`docker run -d -it -p 8080:8080 webao`
