# Clinic Management API

This project is a backend API for managing clinics, doctors, and medical favors. It’s built using **Node.js/Nest.js** and database postgresql.

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
- Each clinic returns full details, including available favors

### Doctors
- Create doctors
- Search by first name, last name, phone number, or email
- Sort by name or surname
- Full doctor details in responses

### Favors
- Create medical favors
- Search by partial favors name
- Sort favors by name

## Business Logic

- There are clinics, each employing doctors.
- A doctor may work in multiple clinics.
- Each doctor can offer one or more favors.
- Admin can manage doctors, clinics, and favors, and access all lists.

**Clinic**: name + list of favors available through its doctors.  
**Doctor**: first/last name + clinics + favors.  
**Favor**: only a name.  
Clinics can be filtered by favors and associated doctors.

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
  npm run start
  ```
Swagger docs available at:
http://localhost:5000/docs

API Testing
A Postman collection:

docs/postman_collection.json



