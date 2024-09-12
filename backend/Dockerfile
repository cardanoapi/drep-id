FROM node:20-alpine as prod
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production


# Builder
FROM prod AS build
RUN yarn install
COPY . .
RUN yarn build

#  Production layer
FROM prod
COPY --from=build /app/dist/ /app/dist/
EXPOSE 3000
CMD ["node", "dist/server.js"]
