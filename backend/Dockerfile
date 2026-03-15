# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copy built code
COPY --from=build /app/dist ./dist

# Copy data into dist/data so the compiled code (dist/routes/*.js) 
# can find it at relative path ../data/
COPY --from=build /app/src/data ./dist/data

EXPOSE 8000

CMD ["node", "dist/index.js"]
