import React                                from 'react';
import cookie                               from 'cookie';
import crypto                               from 'crypto';
import jwt_decode                           from 'jwt-decode';
import nsModules                            from 'modules/list_modules';
import axios                                from '@lib/axios/AxiosInstance';
import { getBlockCMS }                      from '@lib/aquila-connector/blockcms';
import { getBlogList }                      from '@lib/aquila-connector/blog';
import { getCategory, getCategoryProducts } from '@lib/aquila-connector/category';
import { getProducts }                      from '@lib/aquila-connector/product/providerProduct';
import { getUser }                          from '@lib/aquila-connector/user';

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

const nsComponentDataLoader = async (html, data = {}) => {
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
            try {
                const blogList                = await getBlogList();
                nsComponentData['nsBlogList'] = blogList;
            } catch (err) {
                console.error(err);
            }
        } else if (tag === 'ns-cms') {
            if (!attributes['ns-code']) {
                continue;
            }
            if (nsComponentData[`nsCms_${attributes['ns-code']}`]) {
                continue;
            }

            const cmsBlock = await getBlockCMS(attributes['ns-code']);
            if (!cmsBlock) {
                continue;
            }
            nsComponentData[`nsCms_${attributes['ns-code']}`] = cmsBlock;

            // Recursivity
            nsComponentData = await nsComponentDataLoader(cmsBlock.content, nsComponentData);
        } else if (tag === 'ns-product-card-list') {
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
                    lang    : 'fr',
                    PostBody: {
                        filter: { code: attributes.value }
                    }
                };
                const category = await getCategory(postbody);
                if (!category._id) {
                    continue;
                }
                
                try {
                    response = await getCategoryProducts({ id: category._id });
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
                    filter.attributes = { $elemMatch: { code: attributes.type, ['translation.fr.value']: true } };
                }
                try {
                    response = await getProducts(filter);
                } catch(err) {
                    console.error(err);
                }
            }
            nsComponentData[`nsProductList_${hash}`] = response.datas;
        }
    }
    return nsComponentData;
};

const moduleHook = (type, props = {}) => {
    const modules = nsModules.filter((m) => m.type === type);
    if (!modules.length) return false;
    return nsModules.filter((m) => m.type === type).map((m, index) => {
        const Comp = m.jsx.default;
        return React.createElement(Comp, { key: index + m.code, ...props });
    });
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
    nsComponentDataLoader,
    moduleHook,
    ConnectorError
};