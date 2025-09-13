## StubCollect

## Getting Started

### Prerequisites

Ensure you have the following tools installed:

- [Node.js](https://nodejs.org/) `v18.16 or greater` - JavaScript runtime
- [PNPM](https://github.com/pnpm/pnpm) `v8.15 or greater` - Fast, disk space
  efficient package manager

Install pnpm

```bash
    npm install -g pnpm # to install Globally
    npm install pnpm # to install Locally
```

To set up the project, follow these steps:

## Setting the Environment

Instructions: Create the `config.json` File in public directory

Add the following environment variables to the config.json file:'

#Default URL for API requests

```bash
{
    "VITE_APP_API_BASE_URL": "http://localhost:3000/v1", # API URL
    "VITE_APP_VERSION": "1.0.0",
    "PROJECT_NAME": "StubCollect"
}
```

## Running the project

1. Install all the dependencies

```bash
    pnpm install
```

2. Start the development server using Vite, enabling hot module replacement and
   fast development setup using below command at port `5173`.

```bash
    pnpm run dev
```

## Other Available Scripts in Application

Create the production-ready optimized bundle of application in `/dist`
folder

```bash
    pnpm run build
```

Serve the production build of the application locally for preview at port
`4173`.

```bash
    pnpm run preview
```

To host app at IP address

```bash
   pnpm dev --host
```
