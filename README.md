# ChatIn

A project designed to explore and demonstrate the implementation of real-time communication using WebSockets.


---

<div align="center">
    <img width="900" alt="Preview of the project" src="https://github.com/user-attachments/assets/ab01883b-d910-43f7-b055-03a64c8b59f8" />
</div>

---

## Getting Started

### Prerequisites
Before you begin, ensure that you have the following installed on your machine:
- **Node.js** (v14.x or higher): Required to run the server and client applications.
- **npm** (v6.x or higher): Package managers to install dependencies.
- **PostgreSQL**: The database used for storing user information. Ensure you have it installed and set up locally or have access to a remote PostgreSQL instance.

---

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

---

## Real-Time Communication with WebSockets
WebSockets facilitate full-duplex communication between the client and server, enabling real-time data exchange without the overhead of repeated HTTP requests. In this project, WebSockets are used for live messaging and real-time contact list updates. Here’s how it works:

1. **Connection Establishment:**
    - When a user connects to the application, the client upgrades the standard HTTP connection to WebSocket.
    - During this process, the server assigns a unique socket ID to the client and associates it with the user's UID in memory, allowing for multiple socket IDs per user (e.g., for multiple tabs).

2. **Message Routing:**
    - When a user sends a message to a friend, the server identifies the recipient’s UID and retrieves the corresponding active socket IDs.
    - Using these socket IDs, the server sends the message directly to all active WebSocket connections of the intended recipient.

3. **Updating Contact List:**
    - When a user adds a new contact and initiates the conversation with a message, the server updates the recipient’s contact list in the database to include the new contact.
    - The server broadcasts this update to all of the recipient’s active clients via WebSockets, ensuring the new contact is immediately reflected in their contact list accross the browser tabs.

4. **Tearing Down:**
    - When a user disconnects, the server removes their specific socket ID from the mapping to prevent stale connections but keeps the user online if they have other active tabs.

### Example Flow:

1. **Connection:**
    - User A connects and their user ID (userA) is mapped to a set of active socket IDs (e.g., socket123).
    - User B connects and their user ID (userB) is mapped to their active socket IDs (e.g., socket456, socket789 if open in multiple tabs).

2. **Message Sending:**
    - User A sends a message to User B.
    - The server looks up userB’s socket IDs (socket456, socket789) and sends the message directly to all of their active WebSocket connections.

3. **Disconnection:**
    - If User B closes one tab, that specific socket ID (socket456) is removed from the mapping, leaving others active.
    - If User B has no more active connections, future messages to User B are stored in the database, and when User B reconnects, the client retrieves the updated messages.

---

## Contributing
Contributions are welcome! If you have suggestions or improvements, please fork the repository and create a pull request.

**Thanks for checking out this project, Happy coding! :rocket:**
