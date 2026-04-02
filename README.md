# Technical Assessment  

Complete the assessment in 3 days or otherwise stipulated. Do read the following details carefully and thoroughly for the requirements. If you have any queries on the assessment you may ask your interviewer for the contact. If you need time extension do request from your interviewer.

## Problem Statement

Create a React/Svelte frontend in Typescript and NodeJS web backend in Typescript/Javascript with the following functionalities.  

1. Upload a CSV file with appropriate feedback to the user on the upload progress. Data needs to be stored in a database.

2. List the data uploaded with pagination.  

3. Search data from the uploaded file. The web application should be responsive while listing of data and searching of data.  

4. Proper handling and checks for the data uploaded.

5. Real-time collaboration. The application must support two browser sessions simultaneously editing/searching the same dataset. When one user uploads a new CSV that overlaps with existing records (matching by a unique identifier in the data), the application must:
   - Detect duplicate/conflicting records
   - Display a real-time diff UI (without page refresh) showing what changed between the old and new data
   - [Optional] User can be allowed to choose to which version of the data to keep. Tha updates should also be reflected in real-time(within 3 seconds).

## Submission Requirement

In your submission, must include the following:  

1. Use this [csv file](data.csv) as the sample  

2. Include unit tests with complete test cases including edge cases.  

3. Provide a git repository for us to assess your submission.  

4. Provide a docker compose file to run the necessary components for your application.

5. Provide a readme in the git repository on how to setup and run the project.  

# Other notes

- You will be expected to run and demo your application running the docker compose file during the interview.

---

# Setup and Run Instructions

## 1. Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose installed.
- [Bun](https://bun.sh/) (optional, for local tests).

## 2. Quick Start (Docker)
This will start the database, server, and client all at once.
```bash
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000](http://localhost:4000)

## 3. Running Unit Tests
We use `bun test` for fast and reliable unit testing.
```bash
cd server
bun test
```

## 4. Local Development (Manual)
If you prefer to run components manually:
1.  **Database**: Start a PostgreSQL instance.
2.  **Server**:
    ```bash
    cd server
    bun install
    # Update DATABASE_URL in .env
    bunx prisma db push
    bun run index.ts
    ```
3.  **Client**:
    ```bash
    cd client
    bun install
    bun dev
    ```

## 🎥 Demo Walkthrough

1.  **Initial Load**: Open [http://localhost:3000](http://localhost:3000) in two separate windows.
2.  **Seeding Data**: In Tab A, upload the provided `data.csv`. Both tabs will sync and display the data.
3.  **Triggering Conflict**: 
    - Edit `data.csv` locally (e.g., change the `name` of record #1).
    - In Tab B, upload the modified `data.csv`.
4.  **Resolving**: 
    - Only Tab B (the uploader) will see the **Conflict Management** UI.
    - Use the **Toggle Switch** to choose which version to keep.
    - Review the **Final Result Preview**.
    - Click **Apply All Resolutions**.
5.  **Verification**: Tab A will automatically refresh to show the resolved data.
