import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://your-backend-api-url/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;