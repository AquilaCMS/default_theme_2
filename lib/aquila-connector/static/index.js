import Axios from '../../axios/AxiosInstance';

const TMPlang = 'fr';

export const getPageStatic = async (slug_pageStatic) => {
    const postBody = {
        lang    : TMPlang,
        PostBody: {
            limit : 1,
            filter: {
                [`translation.${TMPlang}.slug`]: slug_pageStatic
            }
        }
    };
    try {
        const response = await Axios.post('v2/static', postBody);
        return response.data;
    } catch (err) {
        console.error('Error StaticProvider getPageStatic => ', err);
        return null;
    }
};

export const getStatics = async (PostBody = { filter: {}, limit: 10, structure: { content: 1 } }) => {
    try {
        const response = await Axios.post('v2/statics', { PostBody });
        return response.data;
    } catch (err) {
        console.error('Error StaticProvider getStatics => ', err);
        return { datas: [], count: 0 };
    }
};