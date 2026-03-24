import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("erreur be tsisy otrizany");
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('nomComplet');
      
      window.location.href = '/?message=Session expirée';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;