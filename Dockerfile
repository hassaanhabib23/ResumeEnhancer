FROM node:22-alpine AS build
ARG VITE_PDF_SERVER_URL
ENV VITE_PDF_SERVER_URL=$VITE_PDF_SERVER_URL
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
