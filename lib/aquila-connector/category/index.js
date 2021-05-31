import Axios                                from '../../axios/AxiosInstance';
import { defaultPostBody }                  from '@lib/aquila-connector/category/structure';
import { deepMergeObjects, ConnectorError } from '@lib/utils';

const TMPlang = 'fr';

export const getCategories = async (postBody = {}) => {
    try {
        // Default Postbody for this request
        const _defaultPostBody = defaultPostBody('', TMPlang);
        // Merge default Postbody and the requested postbody
        const _postBody = deepMergeObjects(_defaultPostBody, postBody);
        // Call api with the good Postbody
        const response = await Axios.post('v2/categories', _postBody);
        return response.data;
    } catch (err) {
        console.error('Error CategoryProvider getCategories => ', err);
        return { datas: [], count: 0 };
    }
};


export const getCategory = async (postBody = {}) => {
    // Default Postbody for this request
    const _defaultPostBody = defaultPostBody('', TMPlang);
    // Merge default Postbody and the requested postbody
    const _postBody = deepMergeObjects(_defaultPostBody, postBody);
    // Call api with the good Postbody
    const response = await Axios.post('v2/category', _postBody);
    return response.data;
};

export const getCategoryProducts = async ({ slug = '', id='', postBody = {} }) => {

    // Only the slug ? Need to get the id !
    if (slug) {
        const postBodyReq1 = { PostBody: { filter: { 'translation.fr.slug': slug }, limit: 10, page: 1, structure: { translation: 1 } } };
        const category     = await getCategory(postBodyReq1);
        id                 = category._id;
    }

    if (id) {
        try {
            // Default Postbody for this request
            const _defaultPostBody = defaultPostBody('getCategoryProducts', TMPlang);
            // Merge default Postbody and the requested postbody
            const _postBody = deepMergeObjects(_defaultPostBody, postBody);
            // Call api with the good Postbody
            const response = await Axios.post(`v2/products/category/${id}`, _postBody);
            return response.data;
        } catch (err) {
            console.error('Error CategoryProvider getCategoryProducts => ', err);
            return { datas: [], count: 0 };
        }
    }
    throw new ConnectorError(401, 'Category not found');
};