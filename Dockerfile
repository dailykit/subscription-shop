FROM mhart/alpine-node:12.18.0 as build

ARG GATSBY_ADMIN_SECRET
ARG GATSBY_KEYCLOAK_REALM
ARG GATSBY_CLIENTID
ARG GATSBY_KEYCLOAK_URL
ARG GATSBY_DATA_HUB_WSS
ARG GATSBY_DATA_HUB_HTTPS
ARG GATSBY_GOOGLE_API_KEY
ARG GATSBY_STRIPE_KEY
ARG GATSBY_DAILYKEY_URL

WORKDIR /usr/src/app
COPY package.json ./
RUN yarn
COPY . .

ENV PATH /app/node_modules/.bin:$PATH
ENV GATSBY_ADMIN_SECRET $GATSBY_ADMIN_SECRET 
ENV GATSBY_KEYCLOAK_REALM $GATSBY_KEYCLOAK_REALM 
ENV GATSBY_CLIENTID $GATSBY_CLIENTID
ENV GATSBY_KEYCLOAK_URL $GATSBY_KEYCLOAK_URL
ENV GATSBY_DATA_HUB_WSS $GATSBY_DATA_HUB_WSS
ENV GATSBY_DATA_HUB_HTTPS $GATSBY_DATA_HUB_HTTPS
ENV GATSBY_GOOGLE_API_KEY $GATSBY_GOOGLE_API_KEY
ENV GATSBY_STRIPE_KEY $GATSBY_STRIPE_KEY
ENV GATSBY_DAILYKEY_URL $GATSBY_DAILYKEY_URL

RUN yarn build

FROM nginx:1.15.2-alpine
COPY --from=build /usr/src/app/public /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]