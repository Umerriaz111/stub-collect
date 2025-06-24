FROM public.ecr.aws/docker/library/node:22.14-alpine AS base

# Separate stage for npm authentication
FROM base AS npm-auth
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* ./
ARG GITHUB_NPM_TOKEN
RUN echo "@99Technologies-ai:registry=https://npm.pkg.github.com/" > /root/.npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_NPM_TOKEN}" >> /root/.npmrc

# Dependencies stage that copies from npm-auth
FROM base AS prod-deps
RUN npm install -g pnpm@10.8.1
WORKDIR /usr/src/app
COPY --from=npm-auth /usr/src/app/package.json /usr/src/app/pnpm-lock.yaml* ./
COPY --from=npm-auth /root/.npmrc /root/.npmrc
RUN pnpm install --frozen-lockfile --ignore-scripts && \
    rm /root/.npmrc
COPY . .
RUN pnpm run build && \
    # Cleanup: remove unnecessary files after build
    rm -rf node_modules && \
    rm -rf src && \
    rm -rf public && \
    rm -f package.json pnpm-lock.yaml

FROM public.ecr.aws/nginx/nginx:1.26.3-alpine AS prod 
COPY ./nginx-site.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=prod-deps /usr/src/app/dist . 
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]