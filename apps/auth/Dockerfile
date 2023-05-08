# STAGE: build
FROM node:18-alpine as dist
WORKDIR /tmp/
COPY ["package.json","yarn.lock", "tsconfig.json", "tsconfig.build.json", "./"]
RUN yarn install --frozen-lockfile
COPY src/ src/
RUN yarn run build


# STAGE: node_modules for production
FROM node:18-alpine as node_modules
ENV NODE_ENV=production
WORKDIR /tmp/
COPY ["package.json", "yarn.lock", "tsconfig.json", "./"]  
RUN yarn install --frozen-lockfile && \ 
  # clean up node_modules
  wget -q -O - https://gist.githubusercontent.com/PhantomRay/ba98b8d082876d9cfb6c9b683caae75f/raw/895e0907034a616f8d55cc59285a1348d2fa0453/node_prune.sh | sh && \
  rm -rf node_modules/rxjs/src/ && \
  rm -rf node_modules/rxjs/bundles/ && \
  rm -rf node_modules/rxjs/_esm5/ && \
  rm -rf node_modules/rxjs/_esm2015/ 


# STAGE: final
FROM node:18-alpine
WORKDIR /usr/local/app

COPY --from=node_modules /tmp/node_modules ./node_modules
COPY --from=dist /tmp/dist ./dist

# security
RUN chown -R node:node /usr/local/app
USER node

EXPOSE 3000/tcp
CMD ["node", "dist/main.js"]