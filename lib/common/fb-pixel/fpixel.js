export const FB_PIXEL_ID = ''; // TODO 729645611102132

export const pageview = () => {
    if (FB_PIXEL_ID) {
        window.fbq('track', 'PageView');
    }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name, options = {}) => {
    if (FB_PIXEL_ID) {
        window.fbq('track', name, options);
    }
};




// How to use :

// import * as fbq from '@lib/fpixel'
// const clickOnPurchase = () => {
//     fbq.event('Purchase', { currency: 'USD', value: 10 })
// }