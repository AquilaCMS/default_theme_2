import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

const getCart = async (cartId) => {
    const postBody = {
        'lang'    : TMPlang,
        'PostBody': {
            'populate': ['items.id']
        }
    };
    try {
        const response = await axios.post(`v2/cart/${cartId}`, postBody);
        return response.data;
    } catch(e) {
        console.error('cart.getCart');
        return { datas: {} };
    }
};

export default {
    getCart
};