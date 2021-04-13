import axios from '@lib/axios/AxiosInstance';

const getSiteInfo = async () => {
    try {
        const response    = await axios.post('v2/themeConfig', { 'lang': 'fr','PostBody': {} });
        const themeConfig = response.data;

        const response2 = await axios.post('v2/config', { 'PostBody': { 'structure': { 'environment.siteName': 1 } } });
        const config    = response2.data;
        return { ...themeConfig.config, ...config };
    } catch(e) {
        console.error('site.getSiteInfo');
        return { datas: {} };
    }
};

export default {
    getSiteInfo
};