import axios from '@lib/axios/AxiosInstance';

const TMPLang = 'fr';

// GET orders
export const getOrders = async () => {
    try {
        const PostBody = { sort: { createdAt: -1 }, limit: 100, populate: ['items.id'] };
        const response = await axios.post('v2/orders', {
            lang: TMPLang,
            PostBody
        });
        return response.data;
    } catch(err) {
        console.error('order.getOrders');
        throw new Error(err?.response?.data?.message);
    }
};

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

// GET order bill
export const downloadbillOrder = async (billId) => axios({
    url         : 'v2/bills/generatePDF/',
    method      : 'POST',
    responseType: 'blob',
    data        : {
        PostBody: {
            filter: { _id: billId }
        }
    }
});