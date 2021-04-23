import axios            from '@lib/axios/AxiosInstance';
import { simplifyPath } from '@lib/utils';

const TMPlang = 'fr';

// GET breadcrumb from URL
export const getBreadcrumb = async (url) => {
    try {
        const response = await axios.post('v2/getBreadcrumb', {
            url: simplifyPath(url)
        });
        return response.data;
    } catch(err) {
        console.error('breadcrumb.getBreadcrumb');
        throw new Error(err?.response?.data?.message);
    }
};