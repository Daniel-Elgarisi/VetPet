FROM node:latest
RUN apt-get update && apt-get install -y iputils-ping curl
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "src/server"]