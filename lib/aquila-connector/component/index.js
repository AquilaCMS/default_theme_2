import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

// GET component data
export const getComponent = async (tag, nsCode) => {
    try {
        const response = await axios.post(`v2/component/${tag}/${nsCode}`, { lang: TMPlang });
        return response.data;
    } catch(err) {
        console.error(`component.getComponent [${tag} code: ${nsCode}]`);
        throw new Error(err?.response?.data?.message);
    }
};