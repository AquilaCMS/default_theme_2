import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

export const getProduct = async (slug_product) => {
    const postBody = {
        lang       : TMPlang,
        countviews : true,
        withFilters: false,
        PostBody   : {
            filter: {
                [`translation.${TMPlang}.slug`]: slug_product
            },
            structure: {
                associated_prds: 1,
                bundle_sections: 1,
            },
            populate: [
                'associated_prds',
                'bundle_sections.products.id'
            ],
            limite: 1
        }
    };

    try {
        const response = await axios.post('v2/product', postBody);
        return response.data;
    } catch(e) {
        console.error('product.getProduct');
        return null;
    }

    // Non-explicite "return null" needed
};


export const getProducts = async (filter = {}) => {
    const postBody = {
        lang    : TMPlang,
        PostBody: {
            filter,
            structure: {
                code           : 1,
                attributes     : 1,
                bundle_sections: 1,
                canonical      : 1
            },
            populate: ['bundle_sections.products.id'],
            limit   : 9999
        }
    };
    
    try {
        const response = await axios.post('v2/products', postBody);
        return response.data;
    } catch(e) {
        console.error('product.getProductsFromCategory');
        return { datas: [], count: 0 };
    }
};