import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

// Récupère un panier
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

export const deferredPayment = async (orderNumber, paymentCode) => {
    try {
        await axios.post(`v2/order/pay/${orderNumber}/${TMPlang}`, {
            paymentCode
        });
    } catch (err) {
        console.error('payment.deferredPayment');
        throw new Error(err?.response?.data?.message);
    }
};