#!/bin/bash

# Make sure the script stops if there is an error
set -e

# Check and create .env for Backend
if [ ! -f backend/.env ]; then
  echo "Creating .env for backend from .env.example..."
  cp backend/.env.example backend/.env
else
  echo "Backend .env already exists, skipping..."
fi

if [ ! -f frontend/.env ]; then
  echo "Creating .env for frontend from .env.example..."
  cp frontend/.env.example frontend/.env
else
  echo "Frontend .env already exists, skipping..."
fi

# Run docker-compose for backend (include db)
echo "Starting backend and database..."
chmod +x backend/entrypoint.sh
docker-compose -f backend/docker-compose.yml up --build -d

# Run docker-compose for frontend
echo "Starting frontend..."
docker-compose -f frontend/docker-compose.yml up --build -d

# Notice of completion
echo "Application is running at:"
echo " - Frontend: http://localhost:8080"
echo " - Backend: http://localhost:3000"