# Clinic Management API

This project is a backend API for managing clinics, doctors, and medical services. It’s built using **Node.js** and database postgresql.

## Functionality

### Authentication
- User registration
- Login
- Password reset

### Clinics
- Create clinics
- Search clinics by partial name
- Sort clinics by name
- Filter clinics by services and doctors
- Each clinic returns full details, including available services

### Doctors
- Create doctors
- Search by first name, last name, phone number, or email
- Sort by name or surname
- Full doctor details in responses

### Services
- Create medical services
- Search by partial service name
- Sort services by name

## Business Logic

- There are 5 clinics, each employing doctors.
- A doctor may work in multiple clinics.
- Each doctor can offer one or more services (e.g., traumatology, therapy, vertebrology).
- Admin can manage doctors, clinics, and services, and access all lists.

**Clinic**: name + list of services available through its doctors.  
**Doctor**: first/last name + clinics + services.  
**Service**: only a name.  
Clinics can be filtered by services and associated doctors.

**Example:**  
“Kyiv Vertebrology Clinic”, “Kyiv General Clinic” and “Kyiv Dental Clinic”.  
Dr. John Doe works at Vertebrology and General Clinics and is the only vertebrologist.  
If a user searches for clinics with vertebrology — only those two appear.  
Same result if searching for clinics where John Doe works.

## Tech Stack
- **Node.js** 
- **Nest.js**
- **PostgreSQL**
- **Swagger UI** for API documentation
- **Postman** collection for endpoint testing

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd clinic-api
   ```
2.Install dependencies:
  ```bash
  npm install
  ```
3.Start the development server:
  ```bash
  npm run dev
  ```
Swagger docs available at:
http://localhost:5000/api

API Testing
A Postman collection with all endpoints is included in the /docs directory:

docs/postman_collection.json

