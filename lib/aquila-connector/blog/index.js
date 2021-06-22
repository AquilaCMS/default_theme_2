import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

// GET allergens
export const getBlogList = async () => {
    try {
        const response = await axios.post('v2/site/news', { 
            lang    : TMPlang,
            PostBody: {
                filter: {
                    [`translation.${TMPlang}`]: { $exists: true }
                },
                sort : '-createdAt',
                page : 1,
                limit: 99
            }
        });
        return response.data.datas;
    } catch(err) {
        console.error('blog.getBlogList');
        throw new Error(err?.response?.data?.message);
    }
};