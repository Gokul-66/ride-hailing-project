# Ride Hailing Project(Backend)

## Overview

This project demonstrates a **production-style asynchronous backend system** similar to a ride-hailing application.

The API handles synchronous operations (ride creation), while **driver assignment is processed asynchronously** using **BullMQ + Redis** and a separate worker service.

The entire system is **Dockerized** and uses **MongoDB Atlas** as the database.

---

## High-Level Architecture

```
Client
  |
  v
Ride API (Express)
  - Validates request
  - Stores ride in MongoDB Atlas
  - Pushes job to Redis (BullMQ)
        |
        v
     Redis Queue (ride-queue)
        |
        v
Ride Worker
  - Consumes job
  - Assigns driver asynchronously
  - Updates ride status
        |
        v
     MongoDB Atlas
```

---

## Tech Stack

- **Node.js**
- **Express** – REST API
- **MongoDB Atlas + Mongoose** – Database
- **Redis + BullMQ** – Queue & background jobs
- **Docker & Docker Compose** – Service orchestration

##

---

## Ride Flow

1. Client sends `POST /rides`
2. Ride is saved with status `REQUESTED`
3. Job containing `rideId` is pushed to Redis queue
4. Worker consumes job asynchronously
5. Driver is assigned
6. Ride status updated to `DRIVER_ASSIGNED`

---

## Environment Variables

### Important

`.env` files are **not committed** for security reasons.

Create `.env` files locally using the provided examples.

---

### ride-api/.env

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/ride-db
REDIS_HOST=redis
REDIS_PORT=6379
```

### ride-worker/.env

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/ride-db
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Running the Project (Docker)

### Prerequisites

- Docker
- Docker Compose
- MongoDB Atlas cluster (network access enabled)

---

### Steps to run

```bash
# 1. Clone repository

# 2. Create env files
cp ride-api/.env.example ride-api/.env
cp ride-worker/.env.example ride-worker/.env

# 3. Fill MongoDB Atlas credentials in .env files

# 4. Build and run containers
docker-compose up --build
```

---

## API Endpoints
Get health of data by 
GET /health 

### Create Ride

```
POST /rides
http://localhost:3000/api/rides
example data :-
 {
  "riderName": "John Doe",
  "pickup": "221B Baker Street, London",
  "drop": "10 Downing Street, London"
}
```





**Response**

```json
{
  "_id": "...",
  ...,
  ...,
  "status": "REQUESTED"
}
```

---

### Get Ride

```
GET /rides/:id
http://localhost:3000/api/rides/:id
```



Returns updated ride including driver assignment.

---

## Why Asynchronous Processing?

- Keeps API fast and responsive
- Driver assignment can fail/retry independently
- Worker can scale separately
- Matches real-world backend systems

---

## Docker Design Notes

- API and Worker run in separate containers
- Redis runs as a shared service
- MongoDB is hosted on Atlas (production-like)
- Containers communicate via Docker service names

---

##

