const API = {
  auth: '/api/auth',
  menu: '/api/menu',
  orders: '/api/orders',
  upload: '/api/upload/menu-image',
  contact: '/api/contact',
  blog: '/api/blog'
};

const OWNER_TOKEN_KEY = 'bristo_owner_token';
const OWNER_INFO_KEY = 'bristo_owner_info';

const getOwnerToken = () => localStorage.getItem(OWNER_TOKEN_KEY);
const setOwnerSession = ({ token, owner }) => {
  localStorage.setItem(OWNER_TOKEN_KEY, token);
  localStorage.setItem(OWNER_INFO_KEY, JSON.stringify(owner));
};
const clearOwnerSession = () => {
  localStorage.removeItem(OWNER_TOKEN_KEY);
  localStorage.removeItem(OWNER_INFO_KEY);
};
const getOwnerInfo = () => {
  try {
    return JSON.parse(localStorage.getItem(OWNER_INFO_KEY) || 'null');
  } catch (error) {
    return null;
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

const authorizedJsonOptions = (method, body) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getOwnerToken()}`
  },
  body: JSON.stringify(body)
});

window.BristoAPI = {
  API,
  request,
  getOwnerToken,
  setOwnerSession,
  clearOwnerSession,
  getOwnerInfo,
  authorizedJsonOptions
};
