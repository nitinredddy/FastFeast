FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
COPY admin/package.json ./admin/package.json

RUN npm ci --workspace=admin

COPY admin ./admin

WORKDIR /app/admin

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/admin/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]