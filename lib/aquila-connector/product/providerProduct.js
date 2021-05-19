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
    }

    // Non-explicite "return null" needed
};


export const getProductsFromCategory = async (slug_category) => {
    const postBody = {
        lang    : TMPlang,
        PostBody: {
            'limit' : 99,
            'filter': {
                [`translation.${TMPlang}.slug`]: slug_category
            },
            structure: { translation: 1 }
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