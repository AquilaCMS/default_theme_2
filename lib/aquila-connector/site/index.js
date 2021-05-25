import axios from '@lib/axios/AxiosInstance';

export const getSiteInfo = async () => {
    try {
        const response    = await axios.post('v2/themeConfig', { 'lang': 'fr','PostBody': {} });
        const themeConfig = response.data;

        const response2 = await axios.post('v2/config', { 'PostBody': { 'structure': { 'environment.siteName': 1 } } });
        const config    = response2.data;

        const response3 = await axios.post('v2/languages', { 'PostBody': { 'limit': 99 } });
        const langs     = response3.data.datas;

        return { ...themeConfig.config, ...config, langs };
    } catch(e) {
        console.error('site.getSiteInfo');
        return { datas: {} };
    }
};