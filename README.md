# Project App - Map-Based User Registration System

A full-stack web application featuring a React-based frontend mapping interface and a .NET C# Web API backend utilizing Entity Framework Core and SQLite to save user details along with custom shape geometries.

---

## Project overview

This project demonstrates a full-stack integration of interactive map services with a robust REST API backend. The system allows users to fill out a registration form (Name, Phone, Email) and draw custom geometric shapes (circle, rectangle, or polygon) on a Google Map. On submission, the form data and the serialized geometry coordinates are sent via POST request to a C# Web API backend and saved into a local SQLite database.

---

## Technologies used

### Frontend
- **React 18** & **Vite**: Rapid, modern frontend application development.
- **TailwindCSS**: CSS framework for dynamic styling.
- **@vis.gl/react-google-maps**: Modern React components wrapping the Google Maps JavaScript API.

### Backend
- **C# .NET 10.0** Web API: High-performance backend hosting RESTful HTTP endpoints.
- **Entity Framework Core (EF Core)**: Object-Relational Mapper (ORM) for data persistence.
- **SQLite**: Lightweight, serverless, self-contained SQL database engine.

---

## Setup instructions

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js (v18+ or Bun)](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

### 1. Backend Setup
Change to the backend directory, restore packages, and initialize local tool manifests:
```bash
cd backend
dotnet restore
dotnet tool restore
```

### 2. Frontend Setup
Change to the frontend directory and install the Node modules:
```bash
cd ../frontend
npm install
# or if using Bun:
bun install
```

---

## Database configuration

The database context is configured to use a SQLite database. 

- **Connection String**: The SQLite database string is configured inside [backend/appsettings.json](file:///home/admin/prgms/project-app/backend/appsettings.json).
- **Storage Location**: The database is stored outside of source directories inside the root-level `/database` folder as `project-db` (e.g., `Data Source=../database/project-db`).

### Running Migrations manually
To create or update the database schema via EF Core, run the following commands from the `backend` folder:

1. **Add a Migration**:
   ```bash
   dotnet tool run dotnet-ef migrations add <MigrationName>
   ```
2. **Update the Database**:
   ```bash
   dotnet tool run dotnet-ef database update
   ```

---

## How to run frontend/backend

To run both services locally in development mode:

### Running the Backend
From the `backend` directory, run:
```bash
dotnet run
```
* The backend will spin up and listen on ports **`http://localhost:5000`** (and `https://localhost:5001`).

### Running the Frontend
From the `frontend` directory, run:
```bash
npm run dev
# or if using Bun:
bun run dev
```
* The frontend development server will launch (typically on `http://localhost:5173`). Open this URL in your web browser to interact with the application.
