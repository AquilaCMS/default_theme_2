import React                                       from 'react';
import Cookies                                     from 'cookies';
import cookie                                      from 'cookie';
import crypto                                      from 'crypto';
import jwt_decode                                  from 'jwt-decode';
import nsModules                                   from 'modules/list_modules';
import { getBlockCMS, getBlocksCMS }               from '@aquilacms/aquila-connector/api/blockcms';
import { getBlogList }                             from '@aquilacms/aquila-connector/api/blog';
import { getCategory, getCategoryProducts }        from '@aquilacms/aquila-connector/api/category';
import { getComponent }                            from '@aquilacms/aquila-connector/api/component';
import { getProduct, getProductById, getProducts } from '@aquilacms/aquila-connector/api/product';
import { getUser }                                 from '@aquilacms/aquila-connector/api/user';
import  axios                                      from '@aquilacms/aquila-connector/lib/AxiosInstance';
import { setTokenAxios }                           from '@aquilacms/aquila-connector/lib/utils';

export const deepMergeObjects = (target, source) => {
    // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) Object.assign(source[key], deepMergeObjects(target[key], source[key]));
    }
  
    // Join `target` and modified `source`
    Object.assign(target || {}, source);
    return target;
};

// Returns true if it's a mobile device
export const isMobile = () => {
    if (typeof window !== 'undefined' && navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)) {
        return true;
    } else {
        return false;
    }
};

// Returns an object for redirects in getServerSideProps
export const serverRedirect = (url, permanent = false) => {
    return {
        redirect: {
            permanent,
            destination: url
        }
    };
};

// Get user ID from JWT
export const getUserIdFromJwt = (cookies) => {
    const jwt = cookie.parse(cookies).jwt;
    if (!jwt) return null;
    const user = jwt_decode(jwt);
    if (!user) return null;
    return user.userId;
};

// Return client data or false
// Protect next pages requiring authentication
export const authProtectedPage = async (cookies) => {
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
        console.error(err);
        return false;
    }
};

// Set lang
export const setLangAxios = (lang, req, res) => {
    const cookiesServerInstance = new Cookies(req, res);
    cookiesServerInstance.set('lang', lang, { path: '/', httpOnly: false });
    axios.defaults.headers.common['lang'] = lang;
};

// Unset cookie (serverside/clientside)
export const unsetCookie = (name, cookiesServerInstance = undefined) => {
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

export const simplifyPath = (path) => {
    return path.split('?')[0].split('/');
};

export const cloneObj = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

// Capitalize first letter of string
export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Format date
export const formatDate = (date, lang = 'fr', options = { year: 'numeric', month: 'numeric', day: 'numeric' }) => {
    let timestamp = Date.parse(date);
    let d         = new Date(timestamp).toLocaleDateString(lang, options);
    return d.toString().charAt(0).toUpperCase() + d.toString().slice(1);
};

// Format time
export const formatTime = (time, lang = 'fr', options = { hour: '2-digit', minute: '2-digit' }) => {
    let timestamp = Date.parse(time);
    let d         = new Date(timestamp).toLocaleTimeString(lang, options);
    return d.toString();
};

const aqlRound = (num, places = 2, addingTrailingZeros = true) => {
    let roundNum = +(`${Math.round(`${num}e+${places}`)}e-${places}`);
    if (places !== 0 && addingTrailingZeros) {
        roundNum        = roundNum.toString();
        let intPart     = roundNum;
        let decimalPart = '';

        // if we have a decimal number we split it into two parts
        if (roundNum.includes('.')) {
            roundNum    = roundNum.split('.');
            intPart     = roundNum[0];
            decimalPart = roundNum[1];
        }

        // if the size of the decimal part is not equal to the number of digits after the decimal point given in parameter, we add the missing zeros
        if (decimalPart.length !== places) {
            const numOfMissingZero = places - decimalPart.length;
            decimalPart            = decimalPart.padEnd(numOfMissingZero + decimalPart.length, 0);
        }
        roundNum = `${intPart}.${decimalPart}`;
    }
    return roundNum;
};

// Format price (with thousands separator + €)
export const formatPrice = (price) => {
    const n       = aqlRound(price, 2);
    const array   = n.toString().split('.');
    const integer = Number(array[0]).toLocaleString(); // Adding thousands separator
    const decimal = array[1] ? `.${array[1]}` : '';
    return `${integer}${decimal} €`;
};

// Format order status (color)
export const formatOrderStatus = (code, t) => {
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

// Format stock
export const formatStock = (stock) => {
    if (!stock) {
        return '';
    }
    let color = 'red';
    if (stock.status === 'liv') {
        color = 'green';
    } else if (stock.status === 'dif') {
        color = 'orange';
    } else if (stock.status === 'epu') {
        color = 'red';
    }
    return <span style={{ fontWeight: 'bold', color }}>{stock.value?.replace('{date}', stock.date_supply ? formatDate(stock.date_supply) : '?')}</span>;
};

// Get availability from stock for JSon-LD
export const getAvailability = (stock) => {
    if (!stock) {
        return '';
    }
    let status = 'OutOfStock';
    if (stock.status === 'liv') {
        status = 'InStock';
    } else if (stock.status === 'dif') {
        status = 'PreOrder';
    } else if (stock.status === 'epu') {
        status = 'OutOfStock';
    }
    return status;
};

// Get filter from cookie
export const getFilterAndSortFromCookie = () => {
    const cookieFilter = cookie.parse(document.cookie).filter;
    let filter         = {};
    let sort           = { sortWeight: -1 };
    if (cookieFilter) {
        try {
            filter = JSON.parse(cookieFilter);
            if (filter.sort) {
                sort = filter.sort;
            }
        } catch (err) {
            unsetCookie('filter');
        }
    }
    return { filter, sort };
};

// Convert cookie filter to postbody filter
export const convertFilter = (rawFilter) => {
    if (!Object.entries(rawFilter).length || !rawFilter.conditions || !Object.entries(rawFilter.conditions).length) {
        return {};
    }
    let newFilter = { $and: [] };

    // Search filter management
    if (rawFilter.conditions.$text) {
        newFilter.$text = rawFilter.conditions.$text;
        delete rawFilter.conditions.$text;
    }

    // Price filter management
    // Must be 1st in conditions $and (Aquila constraint)
    if (rawFilter.conditions.price) {
        newFilter.$and.push(rawFilter.conditions.price);
        delete rawFilter.conditions.price;
    }

    // Others filters
    for (const [type, obj] of Object.entries(rawFilter.conditions)) {
        if (Array.isArray(obj)) {
            newFilter.$and = [...newFilter.$and, ...obj];
        } else {
            newFilter.$and.push(obj);
        }
    }
    if (!newFilter.$and.length) {
        delete newFilter.$and;
    }
    return newFilter;
};

// Load components data in CMS block or statics pages
export const nsComponentDataLoader = async (html, lang, data = {}) => {
    let nsComponentData = { ...data };

    // Searching all <ns-[...]>
    const nsComponents = html.match(/(<ns-[^<]*?>)/gm);
    if (!nsComponents) return nsComponentData;

    for (let i = 0; i < nsComponents.length; i++) {
        const attributes = {};
        let match;
        let tag          = '';
        match            = nsComponents[i].match(/<(ns-[a-zA-Z0-9-]*)([^>]*)>/);
        if (match) {
            tag        = match[1];
            const attr = match[2];

            // Get attributes
            if (attr) {
                match = attr.match(/[^\t\r\n\s=]+(="[^"]+")?/g);
                match.forEach((a) => {
                    const attribute  = a.match(/([^\t\r\n\s=]+)(="([^"]+)")?/);
                    const name       = attribute[1];
                    const val        = attribute[3];
                    attributes[name] = val;
                });
            }
        }
        if (tag === 'ns-blog-articles') {
            // Get data of blog
            try {
                const blogList                = await getBlogList(lang);
                nsComponentData['nsBlogList'] = blogList;
            } catch (err) {
                console.error(err);
            }
        } else if (tag === 'ns-cms') {
            // Get data of CMS block
            if (!attributes['ns-code']) {
                continue;
            }

            // If data has already been recovered
            if (nsComponentData[`nsCms_${attributes['ns-code']}`]) {
                continue;
            }

            try {
                const cmsBlock = await getBlockCMS(attributes['ns-code'], lang);
                if (!cmsBlock) {
                    continue;
                }
                nsComponentData[`nsCms_${attributes['ns-code']}`] = cmsBlock;

                // Recursivity
                nsComponentData = await nsComponentDataLoader(cmsBlock.content, lang, nsComponentData);
            } catch (err) {
                console.error(err);
            }
            
        } else if (tag === 'ns-block-slider') {
            // Get data of CMS blockslider
            if (!attributes['ns-code']) {
                continue;
            }

            let codes  = attributes['ns-code'].replace(/\s/g, '').split(',');
            const hash = crypto.createHash('md5').update(codes.join('_')).digest('hex');

            // If data has already been recovered
            if (nsComponentData[`nsBlockSlider_${hash}`]) {
                continue;
            }

            try {
                const cms       = [];
                const cmsBlocks = await getBlocksCMS(codes, lang);
                for (let j = 0; j < cmsBlocks.length; j++) {
                    cms.push(cmsBlocks[j]);

                    // Recursivity
                    nsComponentData = await nsComponentDataLoader(cmsBlocks[j].content, lang, nsComponentData);
                }
                nsComponentData[`nsBlockSlider_${hash}`] = cms;
            } catch (err) {
                console.error(err);
            }
        }  else if (tag === 'ns-product-card') {
            // Get data of product card :
            // - type="id" 
            // - type="code"
            if (!attributes.type) {
                continue;
            }
            if (!attributes.value) {
                continue;
            }

            // If data has already been recovered
            if (nsComponentData[`nsProductCard_${attributes.type}_${attributes.value}`]) {
                continue;
            }
            
            let product;
            try {
                if (attributes.type === 'id') {
                    product = await getProductById(attributes.value, lang);
                } else if (attributes.type === 'code') {
                    const postBody = {
                        PostBody: {
                            filter: { code: attributes.value }
                        }
                    };
                    product        = await getProduct(postBody, false, lang);
                }

                if (!product) {
                    continue;
                }

                nsComponentData[`nsProductCard_${attributes.type}_${attributes.value}`] = product;
            } catch (err) {
                console.error(err);
            }
        } else if (tag === 'ns-product-card-list') {
            // Get data of product card list :
            // - type="category" (code)
            // - type="new"
            // - type="product_id"
            // - type="product_code"
            // - type="list_id"
            // - type="list_code"
            if (!attributes.type) {
                continue;
            }
            if (!attributes.value && attributes.type !== 'new') {
                continue;
            }
            const hash = crypto.createHash('md5').update(`${attributes.type}_${attributes.value}`).digest('hex');
            if (nsComponentData[`nsProductList_${hash}`]) {
                continue;
            }

            const filter = {};
            let response = {};
            if (attributes.type === 'category') {
                const postbody = {
                    lang,
                    PostBody: {
                        filter: { code: attributes.value }
                    }
                };
                const category = await getCategory(lang, postbody);
                if (!category._id) {
                    continue;
                }
                
                try {
                    response = await getCategoryProducts('', category._id, lang);
                } catch(err) {
                    console.error(err);
                }
            } else {
                if (attributes.type === 'new') {
                    filter.is_new = true;
                } else if (attributes.type === 'product_id') {
                    filter._id = attributes.value;
                } else if (attributes.type === 'product_code') {
                    filter.code = attributes.value;
                } else if (attributes.type === 'list_id') {
                    filter._id = { $in: attributes.value.split(',').map((v) => v.trim()) };
                } else if (attributes.type === 'list_code') {
                    filter.code = { $in: attributes.value.split(',').map((v) => v.trim()) };
                } else {
                    continue;
                }
                const postbody = { PostBody: { filter } };
                try {
                    response = await getProducts(false, postbody, lang);
                } catch(err) {
                    console.error(err);
                }
            }
            nsComponentData[`nsProductList_${hash}`] = response.datas;
        } else if (tag === 'ns-gallery' || tag === 'ns-slider') {
            // Get data of gallery or slider
            try {
                const component         = await getComponent(tag, attributes['ns-code'], lang);
                const array             = tag.split('-');
                const newTag            = `${array[0] + capitalizeFirstLetter(array[1])}_${attributes['ns-code']}`;
                nsComponentData[newTag] = component;
            } catch (err) {
                console.error(err);
            }
        }
    }
    return nsComponentData;
};

export const moduleHook = (type, props = {}) => {
    const modules = nsModules.filter((m) => m.type === type);
    if (!modules.length) return false;
    return nsModules.filter((m) => m.type === type).map((m, index) => {
        const Comp = m.jsx.default;
        return React.createElement(Comp, { key: index + m.code, ...props });
    });
};

export class ConnectorError extends Error {
    constructor(code, message = '') {
        super(message);
        this.name = 'ConnectorError';
        this.code = code;
    }
}