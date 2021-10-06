import { useState }                                           from 'react';
import useTranslation                                         from 'next-translate/useTranslation';
import Cookies                                                from 'cookies';
import Error                                                  from '@pages/_error';
import Filters                                                from '@components/common/Filters';
import Pagination                                             from '@components/common/Pagination';
import Layout                                                 from '@components/layouts/Layout';
import NextSeoCustom                                          from '@components/tools/NextSeoCustom';
import ProductList                                            from '@components/product/ProductList';
import { dispatcher }                                         from '@lib/redux/dispatcher';
import { getProducts }                                        from 'aquila-connector/api/product';
import { getSiteInfo }                                        from 'aquila-connector/api/site';
import { useCategoryProducts, useSiteConfig }                 from '@lib/hooks';
import { setLangAxios, cloneObj, convertFilter, unsetCookie } from '@lib/utils';

export async function getServerSideProps({ locale, params, query, req, res, resolvedUrl }) {
    setLangAxios(locale, req, res);

    const search = decodeURIComponent(params.search) || '';

    // Enable / Disable infinite scroll
    let infiniteScroll = false;
    const siteInfo     = await getSiteInfo(locale);
    if (siteInfo.themeConfig?.values?.find(t => t.key === 'infiniteScroll')) {
        infiniteScroll = siteInfo.themeConfig?.values?.find(t => t.key === 'infiniteScroll')?.value;
    }

    // Get cookie server instance
    const cookiesServerInstance = new Cookies(req, res);

    // Get page from GET param or cookie
    // Important : the "page" cookie is used to remember the page when you consult a product and want to go back,
    // we can't do it with Redux because it is reinitialized at each change of page unlike the cookie available on the server side.
    let page        = 1;
    let forcePage   = false;
    const [url]     = resolvedUrl.split('?');
    const queryPage = Number(query.page);
    // If GET "page" param exists, we take its value first
    if (queryPage) {
        page = queryPage;
        if (page > 1) {
            // Ascertainment : "httpOnly: false" is important otherwise we cannot correctly delete the cookie afterwards
            cookiesServerInstance.set('page', JSON.stringify({ url, page }), { path: '/', httpOnly: false, maxAge: 3600000 });
        } else {
            unsetCookie('page', cookiesServerInstance);
        }
        forcePage = true;
    } else {
        const cookiePage = cookiesServerInstance.get('page');
        // If cookie page exists
        if (cookiePage) {
            const dataPage = JSON.parse(cookiePage);
            // We take the value only if category ID matches
            // Otherwise, we delete "page" cookie
            if (dataPage.url === url) {
                page = dataPage.page;
            } else {
                unsetCookie('page', cookiesServerInstance);
            }
        }
    }

    // Get limit (count of products per pages)
    const defaultLimit = siteInfo.themeConfig?.values?.find(t => t.key === 'productsPerPage')?.value || 15;
    let limit          = defaultLimit;

    // If infinite scroll activated (infiniteScroll >= 1 & no force page) and pagination > 1
    // We load all products loaded via infinite scroll
    let requestPage = page;
    if (infiniteScroll && !forcePage && page > 1) {
        requestPage = 1;
        limit       = page * limit;
    }

    // "Empty" request to retrieve price limits
    let initProductsData = {};
    let priceEnd         = { min: 0, max: 0 };
    try {
        initProductsData = await getProducts(false, { PostBody: { filter: { $text: { $search: search } }, page: 1, limit: 1 } }, locale);
    } catch (err) {
        return { notFound: true };
    }
    if (initProductsData.count) {
        priceEnd = {
            min: Math.floor(Math.min(initProductsData.min.ati, initProductsData.specialPriceMin.ati)),
            max: Math.ceil(Math.max(initProductsData.max.ati, initProductsData.specialPriceMax.ati))
        };
    }

    // Get filter from cookie
    const cookieFilter = cookiesServerInstance.get('filter');
    let filter         = {};
    let sort           = { sortWeight: -1 };
    if (cookieFilter) {
        filter = JSON.parse(cookieFilter);
        if (filter.sort) {
            sort = filter.sort;
        }
    }

    // If we change category, we remove the filters
    if (Object.keys(filter).length && filter.category !== 'search-' + search) {
        delete filter.priceValues;
        /*if (filter.conditions?.price) {
            delete filter.conditions.price;
        }
        if (filter.conditions?.attributes) {
            delete filter.conditions.attributes;
        }
        if (filter.conditions?.pictos) {
            delete filter.conditions.pictos;
        }
        // If there are any conditions, price filter must be present (Aquila constraint)
        if (Object.keys(filter.conditions).length) {
            filter.conditions.price = { $or: [{ 'price.ati.normal': { $gte: initProductsData.min.ati, $lte: initProductsData.max.ati } }, { 'price.ati.special': { $gte: initProductsData.min.ati, $lte: initProductsData.max.ati } }] };
        }*/
        delete filter.conditions;
    }

    // Category ID for filter
    filter.category = 'search-' + search;

    if (!filter.conditions) {
        filter.conditions = {};
    }
    filter.conditions.$text = { $search: search };
    
    // Get products
    let productsData = {};
    try {
        productsData = await getProducts(true, { PostBody: { filter: convertFilter(cloneObj(filter)), page: requestPage, limit, sort } }, locale);
    } catch (err) {
        return { notFound: true };
    }

    if (productsData.count) {
        // Conditions for filter
        if (!filter.conditions.price) {
            filter.conditions.price = { $or: [{ 'price.ati.normal': { $gte: productsData.min.ati, $lte: productsData.max.ati } }, { 'price.ati.special': { $gte: productsData.specialPriceMin.ati, $lte: productsData.specialPriceMax.ati } }] };
        }
    }
    cookiesServerInstance.set('filter', JSON.stringify(filter), { path: '/', httpOnly: false, maxAge: 3600000 });

    const actions = [
        {
            type : 'SET_CATEGORY_PAGE',
            value: page
        }, {
            type : 'SET_CATEGORY_PRICE_END',
            value: priceEnd
        }, {
            type : 'SET_CATEGORY_PRODUCTS',
            value: productsData
        }
    ];

    const pageProps = await dispatcher(locale, req, res, actions);
    
    pageProps.props.products = productsData;
    pageProps.props.search   = search;
    return pageProps;
}

export default function Search({ products, search, error }) {
    const [message, setMessage] = useState();
    const { categoryProducts }  = useCategoryProducts();
    const { themeConfig }       = useSiteConfig();
    const { lang, t }           = useTranslation();

    const getProductsList = async (postBody) => {
        try {
            const products = await getProducts(true, postBody, lang);
            return products;
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    if (error) {
        return <Error statusCode={error.code} />;
    }
    
    return (
        <Layout>
            <NextSeoCustom
                noindex={true}
                title="Recherche"
                description="Recherche"
            />

            <div className="content-section-carte">
                {
                    <>
                        <div className="container w-container">
                            {
                                //moduleHook('category-top-list', { limit })
                            }
                        </div>
                        <div className="container-col">
                            <div className="tabs w-tabs">
                                <div id="tabs_content" className="tabs-content w-tab-content">
                                    {
                                        themeConfig?.values?.find(v => v.key === 'filters')?.value === 'top' && (
                                            <div className="div-block-allergenes">
                                                <Filters filtersData={products.filters} getProductsList={getProductsList} />
                                            </div>
                                        )
                                    }
                                    <h6 className="heading-6-center">{t('pages/search:results', { count: categoryProducts.count, search })}</h6>
                                    <Pagination getProductsList={getProductsList}>
                                        <ProductList type="data" value={categoryProducts.datas} />
                                    </Pagination>
                                    {
                                        message && (
                                            <div className={`w-commerce-commerce${message.type}`}>
                                                <div>
                                                    {message.message}
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </>
                }
            </div>
        </Layout>
    );
}