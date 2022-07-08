module.exports = {
    locales      : ['fr', 'en'],
    defaultLocale: 'fr',
    pages        : {
        '*': [
            'common',
            'components/blockSlider',
            'components/blogList',
            'components/bundleProduct',
            'components/cart',
            'components/cartDiscount',
            'components/category',
            'components/cookiesBanner',
            'components/contact',
            'components/filters',
            'components/gallery',
            'components/newsletter',
            'components/navigation',
            'components/pagination',
            'components/product',
            'components/searchBar',
            'components/slider',
            'pages/error',
            'modules/allergen-aquila',
            'modules/food-options-aquila',
            'modules/pointofsale-aquila'
        ],
        '/account': [
            'pages/account/index',
            'components/account/accountLayout',
            'components/orderDetails'
        ],
        '/account/informations': [
            'pages/account/informations',
            'components/account/accountLayout'
        ],
        '/account/rgpd': [
            'pages/account/rgpd',
            'components/account/accountLayout'
        ],
        '/account/login': [
            'pages/account/login',
            'components/login/loginBlock',
            'components/login/registerBlock'
        ],
        '/checkout/cart': [
            'pages/checkout'
        ],
        '/checkout/login': [
            'pages/checkout',
            'components/login/loginBlock',
            'components/login/registerBlock'
        ],
        '/checkout/address': [
            'pages/checkout',
            'components/checkout/addressStep'
        ],
        '/checkout/delivery': [
            'pages/checkout',
            'components/checkout/deliveryStep'
        ],
        '/checkout/payment': [
            'pages/checkout',
            'components/checkout/paymentStep'
        ],
        '/checkout/confirmation': [
            'pages/checkout',
            'components/orderDetails',
        ],
        '/search/[search]': [
            'pages/search'
        ],
        '/[...productSlug]': [
            'pages/product'
        ],
        '/checkemailvalid': [
            'pages/checkemailvalid'
        ],
        '/resetpass': [
            'pages/resetpass'
        ]
    },
    loadLocaleFrom: async (lang, ns) => {
        let result = {};
        try {
            if (ns.indexOf('modules/') === 0) {
                const module = ns.replace('modules/', '');
                result       = await import(`./modules/${module}/translations/${lang}/${module}.json`).then((m) => m.default);
            } else {
                result = await import(`./locales/${lang}/${ns}.json`).then((m) => m.default);
            }
        } catch (err) {
            console.error(`Error loading locale : lang=${lang} | namespace=${ns}`);
        }
        return result;
    },
    logBuild: false
};