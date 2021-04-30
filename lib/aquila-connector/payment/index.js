import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

// GET payment methods
export const getPayments = async () => {
    const PostBody = {
        structure: { component_template_front: 1, makePayment: 1, details: 1 },
        limit    : 100
    };

    try {
        const response = await axios.post('v2/paymentMethods', {
            lang: TMPlang,
            PostBody
        });
        return response.data.datas;
    } catch(err) {
        console.error('payment.getPayments');
        throw new Error(err?.response?.data?.message);
    }
};

// Deferred payment
export const deferredPayment = async (orderNumber, paymentCode) => {
    try {
        await axios.post(`v2/order/pay/${orderNumber}/${TMPlang}`, {
            paymentMethod: paymentCode
        });
    } catch (err) {
        console.error('payment.deferredPayment');
        throw new Error(err?.response?.data?.message);
    }
};