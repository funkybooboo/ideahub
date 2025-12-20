# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# install deps
COPY package.json package-lock.json ./
RUN npm ci

# copy source
COPY . .

# build args for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# build
RUN npm run build

# 2) Production image
FROM nginx:stable-alpine

# copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy built files into nginx html dir
COPY --from=builder /app/dist /usr/share/nginx/html

# expose nginx port
EXPOSE 80

# start nginx
CMD ["nginx", "-g", "daemon off;"]
