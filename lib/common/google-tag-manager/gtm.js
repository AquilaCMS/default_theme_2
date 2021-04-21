export const GTM_ID = ''; // Use GTM-MWGZHLC fo test

export const pageview = (url) => {
    if (GTM_ID) {
        window.dataLayer.push({
            event: 'pageview',
            page : url,
        });
    }
};

export default {
    pageview,
    GTM_ID
};