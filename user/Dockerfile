FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
COPY user/package.json ./user/package.json

RUN npm ci --workspace=user

COPY user ./user

WORKDIR /app/user

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/user/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]