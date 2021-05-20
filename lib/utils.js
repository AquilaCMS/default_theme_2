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

const getUserIdFromJwt = (cookies) => {
    const jwt = cookie.parse(cookies).jwt;
    if (!jwt) return null;
    const user = jwt_decode(jwt);
    if (!user) return null;
    return user.userId;
};

const setTokenAxios = (cookies) => {
    const jwt = cookie.parse(cookies).jwt;
    if (jwt) {
        axios.defaults.headers.common['Authorization'] = jwt;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

const authProtectedPage = async (cookies) => {
    if (!cookies) {
        return false;
    }
    setTokenAxios(cookies);
    const idUser = getUserIdFromJwt(cookies);
    if (!idUser) {
        return false;
    }
    try {
        const data = await getUser(idUser);
        if (!data) {
            return false;
        }
        return data;
    } catch (err) {
        return false;
    }
};

const unsetCookie = (name, cookiesServerInstance = undefined) => {
    if (Array.isArray(name)) {
        for (const n in name) {
            if (cookiesServerInstance) {
                cookiesServerInstance.set(name[n]);
            } else {
                document.cookie = name[n] + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        }
    } else {
        if (cookiesServerInstance) {
            cookiesServerInstance.set(name);
        } else {
            document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    }
};

const simplifyPath = (path) => {
    return path.split('?')[0].split('/');
};

const formatBreadcrumb = (data) => {
    const breadcrumb = [];
    for (let index in data) {
        breadcrumb.push({
            position: Number(index) + 1,
            name    : data[index].text,
            item    : data[index].link
        });
    }
    return breadcrumb;
};

const formatPrice = (price) => {
    const n       = Number(price).toFixed(2);
    const array   = n.toString().split('.');
    const integer = Number(array[0]).toLocaleString();
    const decimal = array[1] ? `.${array[1]}` : '';
    return `${integer}${decimal} €`;
};

const formatOrderStatus = (code, t) => {
    switch (code) {
    case 'ASK_CANCEL':
    case 'CANCELED':
    case 'PAYMENT_CONFIRMATION_PENDING':
    case 'PAYMENT_RECEIPT_PENDING':
    case 'PAYMENT_PENDING':
    case 'PAYMENT_FAILED':
    case 'PROCESSED':
    case 'PROCESSING':
        return <span style={{ color: 'red' }}>{t(`pages/account/index:status.${code}`)}</span>;
    case 'FINISHED':
    case 'BILLED':
    case 'PAID':
    case 'DELIVERY_PROGRESS':
    case 'DELIVERY_PARTIAL_PROGRESS':
    case 'RETURNED':
        return <span style={{ color: 'green' }}>{t(`pages/account/index:status.${code}`)}</span>;
    default:
        return t('pages/account/index:status.DEFAULT');
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
    simplifyPath,
    formatBreadcrumb,
    formatPrice,
    formatOrderStatus,
    ConnectorError
};