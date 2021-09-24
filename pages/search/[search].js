import { useState }                                            from 'react';
import useTranslation                                          from 'next-translate/useTranslation';
import Cookies                                                 from 'cookies';
import cookie                                                  from 'cookie';
import ReactPaginate                                           from 'react-paginate';
import Error                                                   from '@pages/_error';
import Filters                                                 from '@components/common/Filters';
import Layout                                                  from '@components/layouts/Layout';
import NextSeoCustom                                           from '@components/tools/NextSeoCustom';
import ProductList                                             from '@components/product/ProductList';
import { dispatcher }                                          from '@lib/redux/dispatcher';
import { getProducts }                                         from 'aquila-connector/api/product';
import { useCategoryPage, useCategoryProducts, useSiteConfig } from '@lib/hooks';
import { setLangAxios, cloneObj, convertFilter, unsetCookie }  from '@lib/utils';

export async function getServerSideProps({ locale, params, query, req, res }) {
    setLangAxios(locale, req, res);

    const search = params.search || '';

    // Get cookie server instance
    const cookiesServerInstance = new Cookies(req, res);

    // Get page from GET param or cookie
    // Important : the "page" cookie is used to remember the page when you consult a product and want to go back,
    // we can't do it with Redux because it is reinitialized at each change of page unlike the cookie available on the server side.
    let page        = 1;
    const queryPage = Number(query.page);
    // If GET "page" param exists, we take its value first
    if (queryPage) {
        page = queryPage;
        if (page > 1) {
            // Ascertainment : "httpOnly: false" is important otherwise we cannot correctly delete the cookie afterwards
            cookiesServerInstance.set('page', JSON.stringify({ id: 'search', page }), { path: '/', httpOnly: false });
        }
    } else {
        const cookiePage = cookiesServerInstance.get('page');
        // If cookie page exists
        if (cookiePage) {
            const dataPage = JSON.parse(cookiePage);
            // We take the value only if category ID matches
            // Otherwise, we delete "page" cookie
            if (dataPage.id === 'search') {
                page = dataPage.page;
            } else {
                unsetCookie('page', cookiesServerInstance);
            }
        }
    }
    
    // Get limit (count of products per pages)
    const limit = 15;

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
    if (filter.category !== 'search') {
        delete filter.priceValues;
        if (filter.conditions?.price) {
            filter.conditions.price = { $or: [{ 'price.ati.normal': { $gte: 0, $lte: 9999999 } }, { 'price.ati.special': { $gte: 0, $lte: 9999999 } }] };
        }
        if (filter.conditions?.attributes) {
            delete filter.conditions.attributes;
        }
        if (filter.conditions?.pictos) {
            delete filter.conditions.pictos;
        }
    }

    // Category ID for filter
    filter.category = 'search';

    // Get products
    let initProductsData = {};
    let priceEnd         = { min: -1, max: 9999999 };
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
    } else {
        priceEnd = { min: 0, max: 0 };
    }

    if (!filter.conditions) {
        filter.conditions = {};
    }
    filter.conditions.$text = { $search: search };
    
    let productsData = {};
    try {
        productsData = await getProducts(true, { PostBody: { filter: convertFilter(cloneObj(filter)), page, limit, sort } }, locale);
    } catch (err) {
        return { notFound: true };
    }

    if (productsData.count) {
        // Conditions for filter
        if (!filter.conditions.price) {
            filter.conditions.price = { $or: [{ 'price.ati.normal': { $gte: productsData.min.ati, $lte: productsData.max.ati } }, { 'price.ati.special': { $gte: productsData.specialPriceMin.ati, $lte: productsData.specialPriceMax.ati } }] };
        }
    }
    cookiesServerInstance.set('filter', JSON.stringify(filter), { path: '/', httpOnly: false });

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
    
    pageProps.props.limit    = limit;
    pageProps.props.products = productsData;
    return pageProps;
}

export default function Search({ limit, products, error }) {
    const [message, setMessage]                     = useState();
    const { categoryPage, setCategoryPage }         = useCategoryPage();
    const { categoryProducts, setCategoryProducts } = useCategoryProducts();
    const { themeConfig }                           = useSiteConfig();
    const { lang, t }                               = useTranslation();

    const handlePageClick = async (data) => {
        const page = data.selected + 1;

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
            document.cookie = 'page=' + JSON.stringify({ id: 'search', page }) + '; path=/;';
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
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
                                                <Filters category={products} limit={limit} updateProductList={updateProductList} />
                                            </div>
                                        )
                                    }
                                    
                                    <div className="tab-pane-wrap w-tab-pane w--tab-active">
                                        <div className="w-dyn-list">
                                            <ProductList type="data" value={categoryProducts.datas} />
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
                                            pageCount > 1 && (
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
