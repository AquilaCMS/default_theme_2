import axios from '@lib/axios/AxiosInstance';

export const setNewsletter = async (email, name = 'DefaultNewsletter') => {
    const postBody = {
        name,
        'optin': true
    };

    try {
        const response = await axios.post(`v2/newsletter/${email}`, postBody);
        return response.data;
    } catch(err) {
        console.error('newsletter.setNewsletter');
        throw new Error(err?.response?.data?.message);
    }
};