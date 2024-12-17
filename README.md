# ChatIn

A project designed to explore and demonstrate the implementation of real-time communication using WebSockets.

---

## Getting Started

### Prerequisites
Before you begin, ensure that you have the following installed on your machine:
- **Node.js** (v14.x or higher): Required to run the server and client applications.
- **npm** (v6.x or higher): Package managers to install dependencies.
- **PostgreSQL**: The database used for storing user information. Ensure you have it installed and set up locally or have access to a remote PostgreSQL instance.

## Installation

To set up ChatIn locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/JuhilSavani/ChatIn.git
    cd ChatIn
    ```

2. Install dependencies for the backend:
    ```bash
    cd server
    npm install 
    ```

3. Set up the environment variables:
    - Create a **.env** file in the server directory.
    - Copy the **.env.example** file to **.env** in the server directory.
    - Update the values in the **.env** file as needed (e.g., `PG_URI`, `JWT_SECRET`, `PORT`, `ALLOWED_ORIGIN`).

4. Install dependencies for the frontend:
    ```bash
    cd ../client
    npm install 
    ```

5. Database setup:<br/>
This project uses PostgreSQL as its database management system. Follow the steps below to set up the database.
    - Open the terminal on your system.
    - Run the following Command to create a database.
      ```bash
      psql -U postgres -c "CREATE DATABASE chatin_db;"
      ```
    - If you encounter a command not found error for psql, you may need to add PostgreSQL to your system’s PATH environment variable.

6. Start the backend:
    ```bash
    cd server
    npm run dev
    ```

7. Start the frontend(using new terminal window):
    ```bash
    cd client
    npm run dev
    ```

8. Open your browser and access the application at http://localhost:3000.

## Contributing
Contributions are welcome! If you have suggestions or improvements, please fork the repository and create a pull request.

**Thanks for checking out this project, Happy coding! :rocket:**

---