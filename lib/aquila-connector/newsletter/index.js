import axios from '@lib/axios/AxiosInstance';

export const getNewsletter = async (email) => {
    try {
        const response = await axios.get(`v2/newsletter/${email}`);
        return response.data;
    } catch(err) {
        console.error('newsletter.getNewsletter');
        throw new Error(err?.response?.data?.message);
    }
};

export const setNewsletter = async (email, name = 'DefaultNewsletter', optin) => {
    const postBody = {
        name,
        optin
    };

    try {
        const response = await axios.post(`v2/newsletter/${email}`, postBody);
        return response.data;
    } catch(err) {
        console.error('newsletter.setNewsletter');
        throw new Error(err?.response?.data?.message);
    }
};