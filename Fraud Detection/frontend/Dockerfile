###########
# BUILDER #
###########

# react-scripts 5 requires Node >= 14. (Was node:12.18.3-alpine3.9.)
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY ./react_app/package.json ./react_app/package-lock.json ./
RUN npm ci

COPY ./react_app .

ARG API_SERVER
ENV REACT_APP_API_SERVER=${API_SERVER}
RUN npm run build


#########
# FINAL #
#########

FROM node:20-alpine

WORKDIR /usr/src/app

# `serve` is the static server suggested by create-react-app for production.
RUN npm install -g serve@14

COPY --from=builder /usr/src/app/build ./build
