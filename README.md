# Kantan Frontend
This is the frontend for a Kanban board web application called Kantan, bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Installation

```
$ https://github.com/keyine10/kantan-app.git
$ npm install
```

## Create .env file
```
#URL to backend server
KANTAN_BACKEND_API_ENDPOINT=

#JWT configurations, must be the same as backend server's JWT configurations
JWT_SECRET=
JWT_TOKEN_AUDIENCE=
JWT_TOKEN_ISSUER=
JWT_ACCESS_TOKEN_TTL=3600
```

## Running the server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
