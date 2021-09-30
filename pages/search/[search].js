import { useState }                                            from 'react';
import InfiniteScroll                                          from 'react-infinite-scroll-component';
import useTranslation                                          from 'next-translate/useTranslation';
import { useRouter }                                           from 'next/router';
import Cookies                                                 from 'cookies';
import cookie                                                  from 'cookie';
import ReactPaginate                                           from 'react-paginate';
import Error                                                   from '@pages/_error';
import Filters                                                 from '@components/common/Filters';
import Layout                                                  from '@components/layouts/Layout';
import NextSeoCustom                                           from '@components/tools/NextSeoCustom';
import ProductList                                             from '@components/product/ProductList';
import Button                                                  from '@components/ui/Button';
import { dispatcher }                                          from '@lib/redux/dispatcher';
import { getProducts }                                         from 'aquila-connector/api/product';
import { getSiteInfo }                                         from 'aquila-connector/api/site';
import { useCategoryPage, useCategoryProducts, useSiteConfig } from '@lib/hooks';
import { setLangAxios, cloneObj, convertFilter, unsetCookie }  from '@lib/utils';

export async function getServerSideProps({ locale, params, query, req, res }) {
    setLangAxios(locale, req, res);

    const search = decodeURIComponent(params.search) || '';

    // Enable / Disable infinite scroll
    let infiniteScroll = false;
    const siteInfo     = await getSiteInfo(locale);
    if (siteInfo.themeConfig?.values?.find(t => t.key === 'infiniteScroll')) {
        infiniteScroll = siteInfo.themeConfig?.values?.find(t => t.key === 'infiniteScroll')?.value;
    }

    // Get limit (count of products per pages)
    const defaultLimit = siteInfo.themeConfig?.values?.find(t => t.key === 'productsPerPage')?.value || 15;
    let limit          = defaultLimit;

    // Get cookie server instance
    const cookiesServerInstance = new Cookies(req, res);

    // Get page from GET param or cookie
    // Important : the "page" cookie is used to remember the page when you consult a product and want to go back,
    // we can't do it with Redux because it is reinitialized at each change of page unlike the cookie available on the server side.
    let page        = 1;
    let forcePage   = false;
    const queryPage = Number(query.page);
    // If GET "page" param exists, we take its value first
    if (queryPage) {
        page = queryPage;
        if (page > 1) {
            // Ascertainment : "httpOnly: false" is important otherwise we cannot correctly delete the cookie afterwards
            cookiesServerInstance.set('page', JSON.stringify({ id: 'search', page }), { path: '/', httpOnly: false, maxAge: 3600000 });
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
            if (dataPage.id === 'search') {
                page = dataPage.page;
                if (infiniteScroll) {
                    limit = page * limit;
                }
            } else {
                unsetCookie('page', cookiesServerInstance);
            }
        }
    }
    let requestPage = page;
    if (infiniteScroll && !forcePage && page > 1) {
        requestPage = 1;
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
            sort = JSON.parse(filter.sort);
        }
    }

    // If we change category, we remove the filters except the allergens
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
    
    pageProps.props.limit          = defaultLimit;
    pageProps.props.forcePage      = forcePage;
    pageProps.props.infiniteScroll = infiniteScroll;
    pageProps.props.products       = productsData;
    pageProps.props.search         = search;
    return pageProps;
}

export default function Search({ forcePage, infiniteScroll, limit, products, search, error }) {
    const [isLoading, setIsLoading]                 = useState(false);
    const [message, setMessage]                     = useState();
    const { categoryPage, setCategoryPage }         = useCategoryPage();
    const { categoryProducts, setCategoryProducts } = useCategoryProducts();
    const { themeConfig }                           = useSiteConfig();
    const router                                    = useRouter();
    const { lang, t }                               = useTranslation();

    const handlePageClick = async (data) => {
        const page = data.selected + 1;

        if (forcePage) {
            return router.push(`/search/${search}?page=${page}`);
        }

        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        let sort           = { sortWeight: -1 };
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
            if (filter.sort) {
                sort = JSON.parse(filter.sort);
            }
        }

        // Updating the products list
        try {
            const products = await getProducts(true, { PostBody: { filter: convertFilter(filter), page, limit, sort } }, lang);
            setCategoryProducts(products);

            // Updating category page
            setCategoryPage(page);

            // Setting category page cookie
            if (page > 1) {
                document.cookie = 'page=' + JSON.stringify({ id: 'search', page }) + '; path=/; max-age=3600;';
            } else {
                // Page 1... so useless "page" cookie
                unsetCookie('page');
            }
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const loadMoreData = async () => {
        setIsLoading(true);

        const page = categoryPage + 1;

        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        let sort           = { sortWeight: -1 };
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
            if (filter.sort) {
                sort = JSON.parse(filter.sort);
            }
        }

        // Updating the products list
        try {
            const products         = await getProducts(true, { PostBody: { filter: convertFilter(filter), page, limit, sort } }, lang);
            const concatProducts   = [...categoryProducts.datas, ...products.datas];
            categoryProducts.datas = concatProducts;
            setCategoryProducts(categoryProducts);

            // Updating category page
            setCategoryPage(page);

            // Setting category page cookie
            if (page > 1) {
                document.cookie = 'page=' + JSON.stringify({ id: 'search', page }) + '; path=/; max-age=3600;';
            } else {
                // Page 1... so useless "page" cookie
                unsetCookie('page');
            }
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    const updateProductList = async (postBody) => {
        try {
            const products = await getProducts(true, postBody, lang);
            setCategoryProducts(products);

            // Back to page 1
            setCategoryPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const pageCount = Math.ceil(categoryProducts.count / limit);

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
                                                <Filters category={products} updateProductList={updateProductList} />
                                            </div>
                                        )
                                    }
                                    
                                    <div className="tab-pane-wrap w-tab-pane w--tab-active">
                                        <div className="w-dyn-list">
                                            <h6 className="heading-6-center">{t('pages/search:results', { count: categoryProducts.count, search })}</h6>
                                            {
                                                infiniteScroll && !forcePage ? (
                                                    <InfiniteScroll
                                                        dataLength={categoryProducts.datas.length}
                                                        next={infiniteScroll > 1 ? undefined : loadMoreData}
                                                        hasMore={categoryPage < pageCount}
                                                        loader={
                                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                                {
                                                                    infiniteScroll > 1 ? (
                                                                        <Button
                                                                            type="button"
                                                                            text={t('pages/search:loadMoreData')}
                                                                            loadingText={t('pages/search:loading')}
                                                                            isLoading={isLoading}
                                                                            className="w-commerce-commerceaddtocartbutton order-button"
                                                                            hookOnClick={loadMoreData}
                                                                        />
                                                                    ) : (
                                                                        <span>{t('pages/search:loading')}</span>
                                                                    )
                                                                }
                                                            </div>
                                                        }
                                                    >
                                                        <ProductList type="data" value={categoryProducts.datas} />
                                                    </InfiniteScroll>
                                                ) : (
                                                    <ProductList type="data" value={categoryProducts.datas} />
                                                )
                                            }
                                        </div>
                                        {
                                            message && (
                                                <div className={`w-commerce-commerce${message.type}`}>
                                                    <div>
                                                        {message.message}
                                                    </div>
                                                </div>
                                            )
                                        }
                                        {
                                            pageCount > 1 && (!infiniteScroll || forcePage) && (
                                                <ReactPaginate
                                                    previousLabel={'<'}
                                                    nextLabel={'>'}
                                                    breakLabel={'...'}
                                                    forcePage={categoryPage - 1}
                                                    pageCount={pageCount}
                                                    marginPagesDisplayed={2}
                                                    pageRangeDisplayed={5}
                                                    onPageChange={handlePageClick}
                                                    containerClassName={'w-pagination-wrapper pagination'}
                                                    activeClassName={'active'}
                                                />
                                            )
                                        }
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                }
            </div>
        </Layout>
    );
}
