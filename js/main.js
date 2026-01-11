// API Configuration
const API_CONFIG = {
  auth: 'https://microservice-auth-movie.vercel.app/api',
  tickets: 'https://microservice-crud-movie.vercel.app/api'
};

// Utility Functions
function getToken() {
  return localStorage.getItem('authToken');
}

function setToken(token) {
  localStorage.setItem('authToken', token);
}

function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

// Auth Functions
async function login(username, password) {
  try {
    const response = await fetch(`${API_CONFIG.auth}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    throw error;
  }
}

async function register(username, email, full_name, phone, password) {
  try {
    const response = await fetch(`${API_CONFIG.auth}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, full_name, phone, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Ticket Functions
async function apiRequest(url, options = {}) {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    return;
  }
  
  const config = {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  const response = await fetch(url, config);
  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      redirectToLogin();
    }
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return await response.json();
}

async function getMovies() {
  return await apiRequest(`${API_CONFIG.tickets}/movies`);
}

async function createMovie(movieData) {
  return await apiRequest(`${API_CONFIG.tickets}/movies`, {
    method: 'POST',
    body: JSON.stringify(movieData)
  });
}

async function updateMovie(id, movieData) {
  return await apiRequest(`${API_CONFIG.tickets}/movies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(movieData)
  });
}

async function deleteMovie(id) {
  return await apiRequest(`${API_CONFIG.tickets}/movies/${id}`, {
    method: 'DELETE'
  });
}

async function createBooking(bookingData) {
  return await apiRequest(`${API_CONFIG.tickets}/bookings`, {
    method: 'POST',
    body: JSON.stringify(bookingData)
  });
}

async function getBookings() {
  return await apiRequest(`${API_CONFIG.tickets}/bookings`);
}

// Date utility
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID');
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
}

// Currency formatter
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}