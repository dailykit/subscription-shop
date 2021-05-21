# => Build container
FROM node:alpine as builder
WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .

ENV PATH /app/node_modules/.bin:$PATH
ENV SKIP_PREFLIGHT_CHECK true

RUN yarn build
RUN yarn export

# => Run container
FROM nginx:1.15.2-alpine

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

# Static build
COPY --from=builder /usr/src/app/out /usr/share/nginx/html/

# Default port exposure
EXPOSE 80

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./script.sh .
COPY .env .

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x script.sh


# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/script.sh && nginx -g \"daemon off;\""]
