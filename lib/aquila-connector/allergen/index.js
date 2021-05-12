import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

// GET allergens
export const getAllergens = async () => {
    try {
        const response = await axios.post('v2/allergens', { PostBody: { limit: 100 } });
        return response.data.datas;
    } catch(err) {
        console.error('allergen.allergens');
        throw new Error(err?.response?.data?.message);
    }
};