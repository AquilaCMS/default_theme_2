import cookie      from 'cookie';
import jwt_decode  from 'jwt-decode';
import axios       from '@lib/axios/AxiosInstance';
import { getUser } from '@lib/aquila-connector/user';

const deepMergeObjects = (target, source) => {
    // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) Object.assign(source[key], deepMergeObjects(target[key], source[key]));
    }
  
    // Join `target` and modified `source`
    Object.assign(target || {}, source);
    return target;
};

const isMobile = () => {
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)) {
        return true;
    } else {
        return false;
    }
};

const serverRedirect = (url) => {
    return {
        redirect: {
            permanent  : false,
            destination: url
        }
    };
};

const authProtectedPage = async (cookies) => {
    if (!cookies) {
        return false;
    }
    setTokenAxios(cookies);
    try {
        const data = await getUser(cookies);
        if (!data) {
            return false;
        }
        return data;
    } catch (err) {
        return false;
    }
};

const setTokenAxios = (cookies) => {
    const jwt = cookie.parse(cookies).jwt;
    if (jwt) {
        axios.defaults.headers.common['Authorization'] = jwt;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

const getUserIdFromJwt = (cookies) => {
    const jwt = cookie.parse(cookies).jwt;
    if (!jwt) return null;
    const user = jwt_decode(jwt);
    if (!user) return null;
    return user.userId;
};

const unsetCookie = (name, cookiesServerInstance = undefined) => {
    if (cookiesServerInstance) {
        cookiesServerInstance.set(name);
    } else {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};

class ConnectorError extends Error {
    constructor(code, message = '') {
        super(message);
        this.name = 'ConnectorError';
        this.code = code;
    }
}


export {
    deepMergeObjects,
    isMobile,
    serverRedirect,
    authProtectedPage,
    setTokenAxios,
    getUserIdFromJwt,
    unsetCookie,
    ConnectorError
};