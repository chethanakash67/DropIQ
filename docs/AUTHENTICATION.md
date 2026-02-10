# Authentication System Documentation

## Architecture Overview

**Stack:** Node.js + PostgreSQL + JWT  
**Security:** bcrypt password hashing, JWT tokens, rate limiting  
**Token Strategy:** Short-lived access tokens (15min) + Long-lived refresh tokens (7 days)

---

## Database Schema

### Tables Created

```sql
users                  -- User accounts
refresh_tokens         -- JWT refresh token storage
login_attempts         -- Failed login tracking for rate limiting
```

### Migration

```bash
# Run migration
psql -U your_user -d your_db -f src/database/migrations/003_auth_system.sql
```

---

## Backend Implementation

### 1. Environment Setup

Add to `.env`:
```env
JWT_SECRET=your-secret-key-minimum-32-chars-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-chars-change-in-production
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Install Dependencies

```bash
npm install bcrypt jsonwebtoken
```

### 3. API Endpoints

#### **POST /api/auth/signup**
Register new user

Request:
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "fullName": "John Doe"
}
```

Response (201):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Errors:
- 400: Missing fields or validation failure
- 409: Email already exists

---

#### **POST /api/auth/login**
Authenticate user

Request:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Response (200):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Errors:
- 401: Invalid credentials
- 429: Too many failed attempts (rate limited)

---

#### **POST /api/auth/refresh**
Get new access token

Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response (200):
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Errors:
- 401: Invalid or expired refresh token

---

#### **POST /api/auth/logout**
Revoke refresh token (requires auth)

Headers:
```
Authorization: Bearer {accessToken}
```

Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### **GET /api/auth/me**
Get current user info (requires auth)

Headers:
```
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2026-02-10T12:00:00Z",
    "lastLogin": "2026-02-10T15:30:00Z"
  }
}
```

---

### 4. Protecting Routes

```javascript
const { authenticate, authorize } = require('./middleware/auth');

// Require authentication
router.get('/protected', authenticate, (req, res) => {
  res.json({ 
    message: 'Protected data',
    userId: req.user.id 
  });
});

// Require specific role
router.delete('/admin/users/:id', authenticate, authorize('admin'), (req, res) => {
  // Only admins can access
});
```

---

## Frontend Integration (Next.js/React)

### 1. Auth Context Setup

**File:** `context/AuthContext.js`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Load tokens from localStorage on mount
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      fetchUser(storedAccessToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await axios.get('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (error) {
      // Token invalid, try refresh
      await refreshToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    
    const { accessToken, refreshToken, user } = res.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(accessToken);
    setUser(user);
    
    return res.data;
  };

  const signup = async (email, password, fullName) => {
    const res = await axios.post('http://localhost:3000/api/auth/signup', {
      email,
      password,
      fullName
    });
    
    const { accessToken, refreshToken, user } = res.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(accessToken);
    setUser(user);
    
    return res.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await axios.post('http://localhost:3000/api/auth/logout', 
        { refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };

  const refreshTokenFunc = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (!storedRefreshToken) {
      setLoading(false);
      return false;
    }
    
    try {
      const res = await axios.post('http://localhost:3000/api/auth/refresh', {
        refreshToken: storedRefreshToken
      });
      
      const { accessToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      setAccessToken(accessToken);
      await fetchUser(accessToken);
      return true;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken,
      loading, 
      login, 
      signup, 
      logout,
      refreshToken: refreshTokenFunc
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

### 2. Axios Interceptor (Auto Token Refresh)

**File:** `lib/axios.js`

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post('http://localhost:3000/api/auth/refresh', {
          refreshToken
        });

        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### 3. Protected Route Component

**File:** `components/ProtectedRoute.js`

```javascript
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return children;
}
```

---

### 4. Login Page Example

**File:** `pages/login.js`

```javascript
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

---

### 5. Usage in Protected Pages

**File:** `pages/dashboard.js`

```javascript
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import apiClient from '../lib/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const fetchData = async () => {
    // apiClient automatically includes auth token
    const res = await apiClient.get('/products');
    console.log(res.data);
  };

  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.fullName || user?.email}</p>
        <button onClick={logout}>Logout</button>
        <button onClick={fetchData}>Fetch Protected Data</button>
      </div>
    </ProtectedRoute>
  );
}
```

---

## Security Considerations

### 1. **Password Requirements**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Hashed with bcrypt (12 salt rounds)

### 2. **Token Security**
- Access tokens: 15 minutes expiry (reduces exposure window)
- Refresh tokens: 7 days expiry (balance security/UX)
- Refresh tokens stored hashed in database
- Token rotation on logout/compromise

### 3. **Rate Limiting**
- 5 failed login attempts per 15 minutes per email/IP
- In-memory limiter (use Redis for production clusters)

### 4. **Token Storage**
- **Backend:** Refresh tokens hashed in PostgreSQL
- **Frontend:** localStorage (consider httpOnly cookies for better security)

### 5. **HTTPS Required**
- All auth endpoints must use HTTPS in production
- Prevents token interception

---

## Common Failure Points & Solutions

### 1. **401 Unauthorized on Protected Routes**
- **Cause:** Access token expired
- **Solution:** Axios interceptor auto-refreshes token

### 2. **Refresh Token Expired**
- **Cause:** User inactive > 7 days
- **Solution:** Force re-login, clear localStorage

### 3. **Rate Limit Hit**
- **Cause:** 5+ failed login attempts
- **Solution:** Wait 15 minutes or clear login_attempts table

### 4. **Token Mismatch After Server Restart**
- **Cause:** JWT secrets changed/missing
- **Solution:** Ensure .env has consistent JWT_SECRET values

### 5. **CORS Errors on Auth Requests**
- **Cause:** Frontend domain not in CORS whitelist
- **Solution:** Update CORS config in server.js

---

## Testing Auth System

### 1. Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","fullName":"Test User"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

### 3. Test Protected Route
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Test Token Refresh
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

## Production Checklist

- [ ] Generate strong JWT secrets (64+ chars)
- [ ] Enable HTTPS only
- [ ] Use httpOnly cookies instead of localStorage
- [ ] Add CSRF protection
- [ ] Use Redis for rate limiting (distributed systems)
- [ ] Implement email verification
- [ ] Add password reset flow
- [ ] Enable 2FA (optional)
- [ ] Set up monitoring/alerts for failed logins
- [ ] Regular cleanup of old refresh tokens
- [ ] Implement account lockout after X failed attempts

---

## Integration Complete

Your DropIQ application now has production-ready authentication. Next steps:

1. Run database migration
2. Install dependencies: `npm install`
3. Add JWT secrets to `.env`
4. Test backend endpoints
5. Implement frontend auth pages
6. Protect product/DIQ routes as needed
