## Stream Video AI Demo for React

A demo React app that connects to a
[Node.js server](https://github.com/GetStream/openai-tutorial-node), that
integrates Stream's Video SDK with OpenAI's Realtime API.

This project showcases how to build AI-powered video applications with voice
interactions.

Here's a screenshot of the end result:

### What This Repository Contains

The sample code demonstrates how to use Stream's Video SDK to create video calls
and connect them with OpenAI's Realtime API for AI-powered voice interactions.

This repo provides a sample app that showcases the following functionalities:

- connect to the Node.js server and fetch credentials to join a call
- add an AI agent to the call
- show beautiful visualizations of the AI audio levels

### Prerequisites

- You have followed the steps in the
  [Node.js server](https://github.com/GetStream/openai-tutorial-node) and you
  have the server running locally on `http://localhost:3000`.
- Stream account with API key and secret
- OpenAI API key with access to the Realtime API
- Node.js 22 or later

### Usage

After you have the
[Node.js server](https://github.com/GetStream/openai-tutorial-node) on
`http://localhost:3000`, run the app:

```
yarn run dev
```
