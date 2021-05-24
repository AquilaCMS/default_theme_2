import axios from '@lib/axios/AxiosInstance';

export const getUser = async (id_user) => {
    try {
        const response = await axios.post(`v2/user/${id_user}`, { PostBody: {
            structure: {
                addresses       : 1,
                billing_address : 1,
                delivery_address: 1,
                phone_mobile    : 1
            }
        } });
        return response.data;
    } catch(e) {
        console.error('user.getUser');
        throw new Error(e?.response?.data?.message);
    }
};

export const setUser = async (user) => {
    try {
        const response = await axios.put('v2/user', user);
        return response.data;
    } catch(e) {
        console.error('user.setUser');
        throw new Error(e?.response?.data?.message);
    }
};

export const setAddressesUser = async (userId, billingAddress, deliveryAddress, addresses) => {
    try {
        const response = await axios.put('v2/user/addresses', {
            userId,
            billing_address : billingAddress,
            delivery_address: deliveryAddress,
            addresses
        });
        return response.data;
    } catch(e) {
        console.error('user.setAddressesUser');
        throw new Error(e?.response?.data?.message);
    }
};

export const resetPassword = async (token, password = undefined) => {
    try {
        const response = await axios.post('v2/user/resetpassword', { token, password });
        return response.data;
    } catch(e) {
        console.error(e);
        throw new Error(e?.response?.data?.message);
    }
};