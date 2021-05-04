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

const simplifyPath = (path) => {
    return path.split('?')[0].split('/');
};

const getUrlWithLang = (url, lang, langs) => {
    const urlLang = lang === langs.find((l) => l.defaultLanguage === true).code ? '' : lang;
    if (url === '/') {
        return `/${urlLang}`;
    } else {
        if (urlLang) {
            return `/${urlLang}${url}`;
        }
        return url;
    }
};

const getArraySchedules = (currentPOS, date) => {
    const nowTimestamp = Math.trunc(Date.now() / 1000);
    const selDate      = new Date(date);
    const selDay       = selDate.getDay() === 0 ? 6 : selDate.getDay() - 1;
    const timeLine     = currentPOS.deliveryAvailability[selDay]; // Horaires du jour sélectionné
    const step         = currentPOS.timeSlot ? Number(currentPOS.timeSlot) : 30; // Créneau horaire (en minutes)
    const prepareDelay = currentPOS.prepareDelay ? Number(currentPOS.prepareDelay) : 45;

    const array = [];
    if (timeLine) {
        const year  = selDate.getFullYear(); // Année de la date sélectionnée
        const month = selDate.getMonth(); // Mois de la date sélectionnée
        const day   = selDate.getDate(); // Jour de la date sélectionnée

        // On détermine le nombre de commandes par horaire du jour sélectionné
        const orders = {};
        if (currentPOS.orders && currentPOS.orders.length) {
            for (let i = 0; i < currentPOS.orders.length; i++) {
                const order      = currentPOS.orders[i];
                const date_order = new Date(order.date);
                if (`${year}-${month}-${day}` === `${date_order.getFullYear()}-${date_order.getMonth()}-${date_order.getDate()}`) {
                    const hour    = (`0${date_order.getHours()}`).substr(-2);
                    const minute  = (`0${date_order.getMinutes()}`).substr(-2);
                    const index   = `${hour}h${minute}`;
                    orders[index] = orders[index] ? orders[index] + 1 : 1;
                }
            }
        }

        // On boucle sur les 2 créneaux
        for (let i = 1; i <= 2; i++) {
            const min = timeLine[`minHour${i}`];
            const max = timeLine[`maxHour${i}`];
            if (min && max) {
                const [minHour, minMinute] = min.split('h');
                const minTimestamp         = Math.trunc(new Date(year, month, day, minHour, minMinute, 0).getTime() / 1000); // Timestamp min

                const [maxHour, maxMinute] = max.split('h');
                const maxTimestamp         = Math.trunc(new Date(year, month, day, maxHour, maxMinute, 0).getTime() / 1000); // Timestamp max

                // On détermine les horaires en fonction du min et du max
                let t = minTimestamp;
                while (t <= maxTimestamp) {
                    if (t >= nowTimestamp + (prepareDelay * 60)) {
                        const hour   = (`0${new Date(t * 1000).getHours()}`).substr(-2);
                        const minute = (`0${new Date(t * 1000).getMinutes()}`).substr(-2);
                        const slot   = `${hour}h${minute}`;

                        // Si l'horaire n'est pas complet, on l'ajoute
                        if (!orders[slot] || (orders[slot] && orders[slot] < currentPOS.maxOrdersPerSlot)) {
                            array.push(slot);
                        }
                    }
                    t += step * 60; // On augmente en fonction de l'intervalle passé en paramètre
                }
            }
        }
    }

    return array;
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
    formatBreadcrumb,
    simplifyPath,
    getUrlWithLang,
    getArraySchedules,
    ConnectorError
};