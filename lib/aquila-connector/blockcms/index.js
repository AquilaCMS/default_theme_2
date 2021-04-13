import axios from '@lib/axios/AxiosInstance';

const TMPlang = 'fr';

const getBlockCMS = async (code_blockCMS) => {
    const postBody = {
        'lang': TMPlang
    };

    try {
        const response = await axios.post(`v2/component/ns-cms/${code_blockCMS}`, postBody);
        return response.data;
    } catch(e) {
        console.error('Blockcms.getBlockCMS');
        return { datas: {} };
    }
};

const getBlocksCMS = async (blocksCMSCode, postBody={}) => {

    let _postBody = {};

    if(blocksCMSCode.length > 0) {
        _postBody = {   
            lang    : TMPlang,         
            PostBody: {
                filter   : { code: { $in: blocksCMSCode } },
                limit    : blocksCMSCode.length,
                structure: { translation: 1 }
            } };
    }
    else {
        _postBody = {
            'lang'  : TMPlang,
            PostBody: postBody
        };
    }

    try {
        const response = await axios.post('v2/cmsBlocks', _postBody);
        return response.data?.datas; // TODO Si y'en a pas ?
    } catch(e) {
        console.error('Blockcms.getBlocksCMS');
        return { datas: [], count: 0 };
    }
};

export default {
    getBlockCMS,
    getBlocksCMS
};