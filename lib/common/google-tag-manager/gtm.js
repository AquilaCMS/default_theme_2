export const GTM_ID = ''; // TODO GTM-K3BTWVD

export const pageview = (url) => {
    if (GTM_ID) {
        window.dataLayer.push({
            event: 'pageview',
            page : url,
        });
    }
};
