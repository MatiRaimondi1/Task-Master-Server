# TaskMaster Pro - Backend API

##  Live Demo & Frontend
* **Live Application:** [View Live Demo](https://tm-private.vercel.app)
  (If the site doesn't load wait until the server starts again, this is a free host after all.) 
* **Frontend Repository:** [TaskMaster Pro Frontend](https://github.com/MatiRaimondi1/Task-Master-Client)

---

## Tech Stack

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Database:** MongoDB (via MongoDB Atlas)
* **ODM:** Mongoose
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt.js
* **Email Service:** Mailtrap
* **Validation & Security:** CORS, Dotenv, Express-validator

---

## Technical Features

### Advanced Authentication Flow
1.  **Secure Registration:** Passwords are encrypted using Salted Hashing (Bcrypt).
2.  **Email Verification:** Generates a unique 6-digit code sent via SMTP to the user's email.
3.  **Account Status Control:** Users are blocked from logging in until their email is verified (`isVerified: true`).
4.  **Resend Logic:** Smart endpoint to resend verification codes if they expire or get lost.

### Task Management
* Full CRUD (Create, Read, Update, Delete) operations.
* Priority-based filtering and status tracking.
* Ownership middleware: Users can only access or modify their own data.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create account & send verification code |
| `POST` | `/api/auth/verify` | Validate 6-digit code & activate account |
| `POST` | `/api/auth/resend-code` | Generate and send a new verification code |
| `POST` | `/api/auth/login` | Authenticate user & return JWT |

### Tasks (Protected via JWT)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks for the logged-in user |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update task status or content |
| `DELETE` | `/api/tasks/:id` | Remove a task |

---

## Environment Variables

To run this project, you will need to add the following variables to your `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
MAILTRAP_TOKEN=your_mailtrap_token
```

---

## Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/MatiRaimondi1/Task-Master-Server.git
cd task-master-server

```


2. **Install dependencies:**
```bash
npm install

```


3. **Configure environment:**
Create a `.env` file in the root directory and fill in your credentials.
4. **Start the server:**
```bash
npm run start

```
