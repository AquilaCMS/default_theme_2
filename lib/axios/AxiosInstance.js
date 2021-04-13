// First we need to import axios.js
import axios from 'axios';

const options = {
    // .. where we make our configurations
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    /*headers: {
        'Authorization': typeof window !== 'undefined' ? window.localStorage.getItem('jwt') : null
    }*/
};

// Next we make an 'instance' of it
const instance = axios.create(options);

instance.interceptors.request.use(function (config) {
    /*const token = typeof window !== 'undefined' ? window.localStorage.getItem('jwt') : null;
    config.headers.Authorization = token ? token : '';*/
    return config;
});


export default instance;