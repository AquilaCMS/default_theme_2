const nextTranslate = require('next-translate');
module.exports = nextTranslate({
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Powered-by',
                        value: 'AquilaCMS',
                    }
                ],
            },
        ];
    },
    // disable eslint during build https://nextjs.org/docs/api-reference/next.config.js/ignoring-eslint
    eslint: {
        ignoreDuringBuilds: true,
    },
    /*async rewrites () {
        return [
            {
                // Page static
                source     : '/:staticSlug',
                destination: '/static'
            },
            {
                // Page category
                source     : '/c/:categorySlugs*',
                destination: '/category'
            },
            {
                // Page produit
                source     : '/:categorySlugs/:productSlug',
                destination: '/product'
            }
        ];
    }*/
});

// module.exports = {
//     async headers() {
//         return [
//             {
//                 source: '/(.*)',
//                 headers: [
//                     {
//                         key: 'Powered-by',
//                         value: 'AquilaCMS',
//                     }
//                 ],
//             },
//         ]
//     },
// }