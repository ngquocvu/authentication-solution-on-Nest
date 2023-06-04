FROM node:18-alpine

WORKDIR /vunguyen/src/app
COPY package*.json ./

COPY . .
RUN npm install
RUN npx prisma generate

RUN npm run build
EXPOSE 3000 
CMD ["node","dist/src/main"]