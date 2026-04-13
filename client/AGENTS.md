# FRONTEND GUIDELINES

> AI Coding Agent Guidelines for ChatIn - Frontend (React / TanStack Query / Tailwind)

---

## Component Structure Pattern

From `client/src/pages/Home.jsx`:

```jsx
import React, { useRef, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import useAuth from "../utils/hooks/useAuth";
import axios from "../utils/apis/axios";

const ComponentName = () => {
  // 1. Context hooks
  const { user, setIsAuthenticated } = useAuth();
  
  // 2. State declarations
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 3. Refs
  const dialogRef = useRef(null);
  
  // 4. Navigation
  const navigate = useNavigate();

  // 5. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 6. Event handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/endpoint', data);
      toast.success("Success message!");
    } catch (error) {
      console.error(error?.response?.data?.stack || error.stack);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // 7. Render
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

## Context API Pattern

From `client/src/utils/contexts/AuthContext.jsx`:

```jsx
import React, { createContext, useState } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState({});
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
```

**Corresponding hook** (`client/src/utils/hooks/useAuth.jsx`):

```jsx
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

const useAuth = () => useContext(AuthContext);

export default useAuth;
```

## React Query Pattern

**Query hook** (`client/src/utils/controllers/fetchContacts.jsx`):

```jsx
import { useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "../apis/axios";
import useAuth from "../hooks/useAuth";

const fetchContacts = () => {
  const { user } = useAuth();

  const fetchFn = async () => {
    const { data } = await axios.get(`/connections/${user.id}`);
    return data;
  };

  return useQuery({
    queryKey: ["connections", user?.id],
    queryFn: fetchFn,
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 30,      // 30 minutes
    cacheTime: 1000 * 60 * 60,      // 1 hour
    onError: (err) => {
      console.error(err?.response?.data?.stack || err.stack);
      toast.error(err?.response?.data?.message || err.message);
    },
  });
};

export default fetchContacts;
```

**Mutation hook** (`client/src/utils/controllers/sendMessage.jsx`):

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "../apis/axios";

const sendMessage = () => {
  const queryClient = useQueryClient();

  const sendFn = async (messageData) => {
    const { data } = await axios.post(`/messages/send`, messageData);
    return data;
  };

  return useMutation({
    mutationFn: sendFn,
    onSuccess: (newMessage, { connectionId }) => {
      queryClient.setQueryData(["messages", connectionId], (current = []) => {
        if (!Array.isArray(current)) return [newMessage];
        if (current.some((msg) => msg.id === newMessage.id)) return current;
        return [...current, newMessage];
      });
    },
    onError: (err) => {
      console.error(err?.response?.data?.stack || err.stack);
      toast.error(err?.response?.data?.message || err.message);
    },
  });
};

export default sendMessage;
```

## Axios Configuration

From `client/src/utils/apis/axios.jsx`:

```jsx
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_NODE_ENV === "development" 
  ? "http://localhost:4000/api" 
  : "/api";

export default axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,  // Always send cookies for JWT
});
```

## Error Handling Pattern

**Client-side** (consistent throughout):

```jsx
try {
  const response = await axios.post("/endpoint", data);
  toast.success("Success message!");
} catch (error) {
  console.error(error?.response?.data?.stack || error.stack);
  toast.error(error?.response?.data?.message || error.message);
}
```

## Socket.io Client Setup

From `client/src/utils/contexts/SocketContext.jsx`:

```jsx
const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated) {
      const socketInstance = io(BACKEND_URL, {
        withCredentials: true,
        query: { userId: user.id },
      });

      socketInstance.on("newConnection", () => {
        queryClient.invalidateQueries(["connections"]);
      });

      socketInstance.on("newMessage", (newMessage) => {
        queryClient.invalidateQueries(["messages", newMessage.connectionId]);
        toast.success(/* notification JSX */);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated]);
  
  // ...
};
```

## Validation Hook Pattern

From `client/src/utils/hooks/useValidate.jsx`:

```jsx
import { useCallback } from "react";
import validator from "validator";

const useValidate = () => {
  const validate = useCallback((data, options) => {
    if (options.type === "register") {
      if (data.name.length < 3)
        return "Name must be at least 3 characters long.";
    }

    if (!data.email) return "Email is required.";
    if (!validator.isEmail(data.email)) return "Invalid email format.";

    if (!data.password) return "Password is required.";
    if (options.type === "register") {
      if (!validator.isStrongPassword(data.password, {
        minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1,
      }))
        return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.";
    }

    return null;  // null = valid
  }, []);

  return validate;
};

export default useValidate;
```

## Styling Guidelines

### Tailwind CSS Theme

From `client/src/styles.css`:

```css
@theme {
  /* Color Palette */
  --color-primary-black: #333;
  --color-secondary-black: #444;
  --color-primary-white: #FFFFFF;
  --color-secondary-white: #F8F0DF;
  --color-beige: #FCF9C6;
  --color-bisque: #FDE49E;
  --color-green: #9DDE8B;
  --color-deem-red: #F6D6D6;

  /* Typography */
  --font-rubik: Rubik, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  
  --text-sm: 1.05rem;
  --text-md: 1.25rem;
  --text-lg: 1.5rem;
  --text-xl: 2.5rem;
  --text-xxl: 4.5rem;
}
```

### Design System - Neobrutalist Style

The application uses a "neobrutalist" design with:

**Border pattern:**
```jsx
className="border-2 border-[#101010]/75 border-b-[5px]"
```

**Card/container pattern:**
```jsx
className="bg-primary-white rounded-md border-2 border-[#101010]/75 border-b-[5px]"
```

**Button pattern (primary):**
```jsx
className="flex-1 bg-primary-black text-white text-md py-2 px-4 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center justify-center font-semibold hover:bg-secondary-black cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
```

**Button pattern (secondary):**
```jsx
className="flex-1 bg-primary-white text-md py-2 px-4 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex justify-center items-center font-semibold hover:ring-2 hover:ring-[#101010]/75 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
```

**Input pattern:**
```jsx
className="w-full py-3 px-4 text-inherit bg-primary-white border-2 border-secondary-black rounded-md text-sm transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
```

### Icons

Use **Boxicons** via CDN (already included in `index.html`):

```jsx
<i className="bx bx-user-circle text-[2.8rem]"></i>
<i className="bx bxs-contact text-[1.875rem]"></i>
<i className="bx bx-loader-alt chatin-loading-spinner text-[1.35rem]"></i>
```

### Loading Spinner

```jsx
<span className="chatin-loading-indicator">
  <i className="bx bx-loader-alt chatin-loading-spinner text-[1.35rem]"></i>
  Loading...
</span>
```

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm:`, `lg:`
- Grid pattern for main layout:

```jsx
className="grid grid-cols-1 lg:grid-cols-[minmax(18rem,3fr)_minmax(0,7fr)]"
```
