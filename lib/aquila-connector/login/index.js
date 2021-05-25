import axios from '@lib/axios/AxiosInstance';

const TMPLang = 'fr';

export const auth = async (username, password) => {
    try {
        const response = await axios.post('v2/auth/login/', { username, password });
        return response.data;
    } catch(err) {
        console.error('login.auth');
        throw new Error(err?.response?.data?.message);
    }
};

export const sendMailResetPassword = async (email) => {
    try {
        const response = await axios.post(`v2/user/resetpassword/${TMPLang}`, { email });
        return response.data;
    } catch(err) {
        console.error('login.resetPassword');
        throw new Error(err?.response?.data?.message);
    }
};