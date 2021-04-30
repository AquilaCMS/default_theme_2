import axios from '@lib/axios/AxiosInstance';

const TMPLang = 'fr';

// GET order by ID
export const getOrderById = async (orderId) => {
    try {
        const response = await axios.post(`v2/order/${orderId}`, {
            lang    : TMPLang,
            PostBody: {}
        });
        return response.data;
    } catch(err) {
        console.error('order.getOrderById');
        throw new Error(err?.response?.data?.message);
    }
};