# Docker file for a single container
# Use the official Node.js image as a base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container (SERVER)
COPY code/server/package*.json ./server/
RUN cd server && npm install

# Copy package.json and package-lock.json to the container (CLIENT)
COPY code/client/package*.json ./client/
RUN cd client && npm install

# Copy the rest of the server code to the container
COPY code/ ./code/

# Compile the code
RUN cd client && npm run build
RUN cd server && npm run build

# Expose port 3000 to the outside world
CMD npm --prefix ./server run start & npx serve -s ./client/build -l 3000
