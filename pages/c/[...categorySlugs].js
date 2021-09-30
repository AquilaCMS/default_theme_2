import { useState }                                                                         from 'react';
import InfiniteScroll                                                                       from 'react-infinite-scroll-component';
import absoluteUrl                                                                          from 'next-absolute-url';
import Head                                                                                 from 'next/head';
import { useRouter }                                                                        from 'next/router';
import getT                                                                                 from 'next-translate/getT';
import useTranslation                                                                       from 'next-translate/useTranslation';
import Cookies                                                                              from 'cookies';
import cookie                                                                               from 'cookie';
import ReactPaginate                                                                        from 'react-paginate';
import Error                                                                                from '@pages/_error';
import Filters                                                                              from '@components/common/Filters';
import Layout                                                                               from '@components/layouts/Layout';
import NextSeoCustom                                                                        from '@components/tools/NextSeoCustom';
import Breadcrumb                                                                           from '@components/navigation/Breadcrumb';
import CategoryList                                                                         from '@components/category/CategoryList';
import ProductList                                                                          from '@components/product/ProductList';
import MenuCategories                                                                       from '@components/navigation/MenuCategories';
import Button                                                                               from '@components/ui/Button';
import { dispatcher }                                                                       from '@lib/redux/dispatcher';
import { getBreadcrumb }                                                                    from 'aquila-connector/api/breadcrumb';
import { getCategory, getCategoryProducts }                                                 from 'aquila-connector/api/category';
import { getSiteInfo }                                                                      from 'aquila-connector/api/site';
import { useCategoryPage, useCategoryProducts, useSiteConfig }                              from '@lib/hooks';
import { setLangAxios, formatBreadcrumb, cloneObj, convertFilter, moduleHook, unsetCookie } from '@lib/utils';

export async function getServerSideProps({ locale, params, query, req, res, resolvedUrl }) {
    setLangAxios(locale, req, res);

    const categorySlugs = Array.isArray(params.categorySlugs) ? params.categorySlugs : [params.categorySlugs];
    const t             = await getT(locale, 'common');
    
    // Get category from slug
    let categories = [];
    for (let slug of categorySlugs) {
        try {
            const cat = await getCategory(locale, { PostBody: { filter: { [`translation.${locale}.slug`]: slug } } });
            if (cat) {
                categories.push(cat);
            }
        } catch (err) {
            return { notFound: true };
        }
    }
    const category = categories.length ? categories[categories.length - 1] : {};

    // Get URLs for language change
    const slugsLangs    = {};
    const urlsLanguages = [];
    for (const c of categories) {
        for (const [lang, sl] of Object.entries(c.slug)) {
            if (!slugsLangs[lang]) {
                slugsLangs[lang] = [];
            }
            slugsLangs[lang].push(sl);
        }
    }
    for (const [lang, sl] of Object.entries(slugsLangs)) {
        urlsLanguages.push({ lang, url: `/c/${sl.join('/')}` });
    }

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
            cookiesServerInstance.set('page', JSON.stringify({ id: category._id, page }), { path: '/', httpOnly: false, maxAge: 3600000 });
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
            if (dataPage.id === category._id) {
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
        initProductsData = await getCategoryProducts('', category._id, locale, { PostBody: { page: 1, limit: 1 } });
    } catch (err) {
        return { notFound: true };
    }
    if (initProductsData.count) {
        priceEnd = {
            min: Math.floor(Math.min(initProductsData.priceMin.ati, initProductsData.specialPriceMin.ati)),
            max: Math.ceil(Math.max(initProductsData.priceMax.ati, initProductsData.specialPriceMax.ati))
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
    if (Object.keys(filter).length && filter.category !== category._id) {
        delete filter.priceValues;
        if (filter.conditions?.price) {
            delete filter.conditions.price;
        }
        if (filter.conditions?.attributes) {
            delete filter.conditions.attributes;
        }
        if (filter.conditions?.pictos) {
            delete filter.conditions.pictos;
        }
        if (filter.conditions?.$text) {
            delete filter.conditions.$text;
        }
        // If there are any conditions, price filter must be present (Aquila constraint)
        if (Object.keys(filter.conditions).length) {
            filter.conditions.price = { $or: [{ 'price.ati.normal': { $gte: initProductsData.priceMin.ati, $lte: initProductsData.priceMax.ati } }, { 'price.ati.special': { $gte: initProductsData.priceMin.ati, $lte: initProductsData.priceMax.ati } }] };
        }
    }

    // Category ID for filter
    filter.category = category._id;

    // Get products
    let productsData = {};
    try {
        productsData = await getCategoryProducts('', category._id, locale, { PostBody: { filter: convertFilter(cloneObj(filter)), page: requestPage, limit, sort } });
    } catch (err) {
        return { notFound: true };
    }
    
    if (productsData.count) {
        // Conditions for filter
        if (!filter.conditions) {
            filter.conditions = {};
        }
        if (!filter.conditions.price) {
            filter.conditions.price = { $or: [{ 'price.ati.normal': { $gte: productsData.priceMin.ati, $lte: productsData.priceMax.ati } }, { 'price.ati.special': { $gte: productsData.specialPriceMin.ati, $lte: productsData.specialPriceMax.ati } }] };
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
        }, {
            type : 'SET_URLS_LANGUAGES',
            value: urlsLanguages
        }
    ];

    const pageProps = await dispatcher(locale, req, res, actions);

    // Get breadcrumb
    let breadcrumb = [];
    try {
        breadcrumb = await getBreadcrumb(resolvedUrl);
    } catch (err) {
        console.error(err.message || t('common:message.unknownError'));
    }

    // URL origin
    const { origin } = absoluteUrl(req);
    
    pageProps.props.categorySlugs    = categorySlugs.join('/');
    pageProps.props.origin           = origin;
    pageProps.props.breadcrumb       = breadcrumb;
    pageProps.props.category         = category;
    pageProps.props.initProductsData = initProductsData;
    pageProps.props.limit            = defaultLimit;
    pageProps.props.forcePage        = forcePage;
    pageProps.props.infiniteScroll   = infiniteScroll;
    return pageProps;
}

export default function Category({ breadcrumb, category, categorySlugs, forcePage, infiniteScroll, initProductsData, limit, origin, error }) {
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
            return router.push(`/c/${categorySlugs}?page=${page}`);
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
            const products = await getCategoryProducts('', category._id, lang, { PostBody: { filter: convertFilter(filter), page, limit, sort } });
            setCategoryProducts(products);

            // Updating category page
            setCategoryPage(page);

            // Setting category page cookie
            if (page > 1) {
                document.cookie = 'page=' + JSON.stringify({ id: category._id, page }) + '; path=/; max-age=3600;';
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
            const products         = await getCategoryProducts('', category._id, lang, { PostBody: { filter: convertFilter(filter), page, limit, sort } });
            const concatProducts   = [...categoryProducts.datas, ...products.datas];
            categoryProducts.datas = concatProducts;
            setCategoryProducts(categoryProducts);

            // Updating category page
            setCategoryPage(page);

            // Setting category page cookie
            if (page > 1) {
                document.cookie = 'page=' + JSON.stringify({ id: category._id, page }) + '; path=/; max-age=3600;';
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
            const products = await getCategoryProducts('', category._id, lang, postBody);
            setCategoryProducts(products);

            // Back to page 1
            setCategoryPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    let queryPage = Number(router.query.page);
    if (!queryPage) {
        queryPage = 1;
    }
    const pageCount = Math.ceil(categoryProducts.count / limit);

    if (error) {
        return <Error statusCode={error.code} />;
    }
    
    return (
        <Layout>
            <NextSeoCustom
                title={category.name}
                description={category.metaDescription}
                canonical={`${origin}/c/${categorySlugs}${queryPage > 1 ? `?page=${queryPage}` : ''}`}
                lang={lang}
                image={`${origin}/images/medias/max-100/605363104b9ac91f54fcabac/Logo.jpg`}
            />

            <Head>
                {
                    queryPage > 1 && <link rel="prev" href={`${origin}/c/${categorySlugs}${queryPage === 2 ? '' : `?page=${queryPage - 1}`}`} />
                }
                {
                    (queryPage >= 1) && queryPage < pageCount && <link rel="next" href={`${origin}/c/${categorySlugs}?page=${queryPage + 1}`} />
                }
            </Head>

            <div dangerouslySetInnerHTML={{
                __html: category.extraText,
            }} />

            {
                moduleHook('category-top')
            }

            <Breadcrumb items={formatBreadcrumb(breadcrumb)} />

            <div className="content-section-carte">
                {
                    initProductsData.count === 0 && category.children.length ? (
                        <>
                            <div className="container w-container">
                                <p className="paragraph-seo" dangerouslySetInnerHTML={{
                                    __html: category.extraText2,
                                }} />
                            </div>
                            <div className="container-col">
                                <div className="tabs w-tabs">
                                    <div id="tabs_content" className="tabs-content w-tab-content">
                                        <div className="tab-pane-wrap w-tab-pane w--tab-active">
                                            <div className="w-dyn-list">
                                                <CategoryList categoryList={category.children} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="container w-container">
                                <p className="paragraph-seo" dangerouslySetInnerHTML={{
                                    __html: category.extraText2,
                                }} />
                                {
                                    moduleHook('category-top-list')
                                }
                            </div>
                            <div className="container-col">
                                <MenuCategories />

                                <div className="tabs w-tabs">
                                    <div id="tabs_content" className="tabs-content w-tab-content">
                                        {
                                            themeConfig?.values?.find(v => v.key === 'filters')?.value === 'top' && (
                                                <div className="div-block-allergenes">
                                                    <Filters category={category} updateProductList={updateProductList} />
                                                </div>
                                            )
                                        }
                                        
                                        <div className="tab-pane-wrap w-tab-pane w--tab-active">
                                            <div className="w-dyn-list">
                                                {
                                                    infiniteScroll > 0 && !forcePage ? (
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
                                                                                text={t('pages/category:loadMoreData')}
                                                                                loadingText={t('pages/category:loading')}
                                                                                isLoading={isLoading}
                                                                                className="w-commerce-commerceaddtocartbutton order-button"
                                                                                hookOnClick={loadMoreData}
                                                                            />
                                                                        ) : (
                                                                            <span>{t('pages/category:loading')}</span>
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
                    )
                }
                
                <div className="container w-container">
                    <p className="paragraph-seo" dangerouslySetInnerHTML={{
                        __html: category.extraText3,
                    }} />
                </div>
            </div>
        </Layout>
    );
}
