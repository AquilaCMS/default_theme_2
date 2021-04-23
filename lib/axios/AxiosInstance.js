// First we need to import axios.js
import axios  from 'axios';
import cookie from 'cookie';

const options = {
    // .. where we make our configurations
    baseURL: process.env.NEXT_PUBLIC_API_URL,
};

// Next we make an 'instance' of it
const instance = axios.create(options);

instance.interceptors.request.use(function (config) {
    const jwt = typeof window !== 'undefined' ? cookie.parse(document.cookie).jwt : null;
    if (jwt) {
        config.headers.Authorization = jwt;
    } else {
        delete config.headers.Authorization;
    }
    return config;
});

export default instance;