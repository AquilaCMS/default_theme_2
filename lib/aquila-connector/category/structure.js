export const defaultPostBody = (type, lang) => {
    switch (type) {
    case 'getCategoryProducts':
        return {
            lang    : lang,
            PostBody: {
                filter   : {},
                structure: {
                    slug       : 1,
                    visible    : 1,
                    pos        : 1,
                    stock      : 1,
                    universe   : 1,
                    reviews    : 1,
                    price      : 1,
                    type       : 1,
                    translation: 1,
                    images     : 1,
                    pictos     : 1,
                    weight     : 1
                },
                limit: 15,
                page : 1,
                sort : {
                    sortWeight: -1
                }
            }
        };
    default:
        return {
            lang    : lang,
            PostBody: {
                filter   : {},
                structure: '*'
            }
        };
    }



};
