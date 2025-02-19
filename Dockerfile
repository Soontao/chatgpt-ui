FROM node:18-alpine3.16 as builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build


FROM node:18-alpine3.16

ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=80

WORKDIR /app

COPY --from=builder /app/.output .

EXPOSE 80

ENTRYPOINT ["node", "server/index.mjs"]