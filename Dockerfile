# ---------- 1) BUILD STAGE: compile TS ----------
FROM alpine:3.20 AS builder
RUN apk add --no-cache nodejs npm python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build            # --> dist/*

# ---------- 2) PROD-DEPS STAGE: only prod node_modules ----------
FROM alpine:3.20 AS proddeps
RUN apk add --no-cache nodejs npm
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
# node_modules now contains ONLY prod deps

# ---------- 3) RUNTIME STAGE: no npm, just node runtime ----------
FROM alpine:3.20 AS runner
# only what we need to RUN (nodejs). No npm here.
RUN apk add --no-cache nodejs
WORKDIR /app
# non-root user
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

# copy compiled code + prod deps only
COPY --from=builder  --chown=nodeapp:nodeapp /app/dist         ./dist
COPY --from=proddeps --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --from=proddeps --chown=nodeapp:nodeapp /app/package*.json ./

ENV NODE_ENV=production
EXPOSE 8000
USER nodeapp
CMD ["node","dist/server.js"]  
