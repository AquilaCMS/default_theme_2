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
    } catch(err) {
        console.error('user.getUser');
        throw new Error(err?.response?.data?.message);
    }
};

export const setUser = async (user) => {
    try {
        const response = await axios.put('v2/user', user);
        return response.data;
    } catch(err) {
        console.error('user.setUser');
        throw new Error(err?.response?.data?.message);
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
    } catch(err) {
        console.error('user.setAddressesUser');
        throw new Error(err?.response?.data?.message);
    }
};

export const resetPassword = async (token, password = undefined) => {
    try {
        const response = await axios.post('v2/user/resetpassword', { token, password });
        return response.data;
    } catch(err) {
        console.error('user.resetPassword');
        throw new Error(err?.response?.data?.message);
    }
};

export const validateAccount = async (token) => {
    try {
        const response = await axios.post('v2/user/active/account', { activateAccountToken: token });
        return response.data;
    } catch(err) {
        console.error('user.validateAccount');
        throw new Error(err?.response?.data?.message);
    }
};

export const dataUserExport = async (userId) => {
    try {
        return axios({
            url         : `v2/rgpd/export/${userId}`,
            method      : 'GET',
            responseType: 'blob'
        });
    } catch(err) {
        const b   = new Blob([err.response.data]);
        const fr  = new FileReader();
        fr.onload = function () {
            const result = JSON.parse(this.result);
            throw new Error(result.message);
        };
        fr.readAsText(b);
    }
};

export const anonymizeUser = async (userId) => {
    try {
        await axios.get(`v2/rgpd/anonymizeUser/${userId}`);
    } catch(err) {
        console.error('user.anonymizeUser');
        throw new Error(err?.response?.data?.message);
    }
};

export const deleteUser = async (userId) => {
    try {
        await axios.delete(`v2/rgpd/deleteUser/${userId}`);
    } catch(err) {
        console.error('user.deleteUser');
        throw new Error(err?.response?.data?.message);
    }
};