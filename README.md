# Stream Video + AI Demo

## Running locally

Make sure `.env` has correct credentials. Use `.env.example` as a template.

> If you're running [backend](https://github.com/GetStream/video-ai-demo/server)
> locally, point to it like this:
>
> ```
> VITE_AGENT_MANAGER_URL=http://localhost:3000
> ```

To start the app locally:

```
yarn run dev
```

Server will start listening at port 5173.

## Deployment (for Stream employees)

This project is deployed to Vercel. To link Vercel CLI locally:

```
npx vercel link
```

Then select project `getstreamio/video-ai-demo`. This project already has
environment variables configured, but if you're going to prebuld it locally:

```
npx vercel pull
npx vercel build
```

To create a new deployment:

```
npx vercel deploy
```

(Or `deploy --prebuilt` if you've built the project locally.)
