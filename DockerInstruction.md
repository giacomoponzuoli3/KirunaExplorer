# Kiruna Explorer App (Docker Guide)

## Requirements
- Docker installed on your system.
- Internet connection to pull the images.
- Steps to run the app

## How to build the Docker image
Open a bash from the code folder and type:
```bash
docker compose build
```

## How to run the Docker image
Open a bash from the code folder and type:
```bash
docker compose up
```

## Pull the Docker images
Run the following command to download the client and server images:

```bash
docker pull mbollo/se2-2024-12-kiruna-explorer:server
docker pull mbollo/se2-2024-12-kiruna-explorer:client
```

## Run the containers manually
Run the server container with the command:
```bash
docker run -d -p 4000:4000 --name kiruna-server mbollo/se2-2024-12-kiruna-explorer:server
```
Run the client container with the command:
```bash
docker run -d -p 3000:3000 --name kiruna-client mbollo/se2-2024-12-kiruna-explorer:client
```

## Alternative: Use Docker Compose
If you prefer, you can create a docker-compose.yml file to start both containers with a single command.

Example docker-compose.yml:
```bash
version: '3.8'

services:
  server:
    image: mbollo/se2-2024-12-kiruna-explorer:server
    ports:
      - "4000:4000"

  client:
    image: mbollo/se2-2024-12-kiruna-explorer:client
    ports:
      - "3000:3000"
```

## Running with Docker Compose
Start the containers with:
```bash
docker-compose up
```

## Access the application
Once the containers are running, open your browser and access the app:

Client: http://localhost:3000
Server: http://localhost:4000

## Useful commands
### Check running containers
Use this command to check if the containers are running:
```bash
docker ps
```

### Stop the containers
With Docker Compose:
```bash
docker-compose down
```
Manually:
```bash
docker stop kiruna-client kiruna-server
docker rm kiruna-client kiruna-server
```
