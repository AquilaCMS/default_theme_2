import { useState }                             from 'react';
import dynamic                                  from 'next/dynamic';
import absoluteUrl                              from 'next-absolute-url';
import getT                                     from 'next-translate/getT';
import useTranslation                           from 'next-translate/useTranslation';
import Cookies                                  from 'cookies';
import cookie                                   from 'cookie';
import ReactPaginate                            from 'react-paginate';
import Error                                    from '@pages/_error';
import Layout                                   from '@components/layouts/Layout';
import NextSeoCustom                            from '@components/tools/NextSeoCustom';
import Breadcrumb                               from '@components/navigation/Breadcrumb';
import ProductList                              from '@components/product/ProductList';
import MenuCategories                           from '@components/navigation/MenuCategories';
import Allergen                                 from 'modules/Allergen';
import { dispatcher }                           from '@lib/redux/dispatcher';
import { getBreadcrumb }                        from 'aquila-connector/api/breadcrumb';
import { getCategories, getCategoryProducts }   from 'aquila-connector/api/category';
import { formatBreadcrumb, unsetCookie }        from '@lib/utils';
import { useCategoryPage, useCategoryProducts } from '@lib/hooks';

const ClickAndCollect = dynamic(() => import('modules/ClickAndCollect'));

export async function getServerSideProps({ locale, params, query, req, res, resolvedUrl }) {
    const categorySlugs = Array.isArray(params.categorySlugs) ? params.categorySlugs : [params.categorySlugs];
    const slug          = categorySlugs[categorySlugs.length - 1];
    const t             = await getT(locale, 'common');
    
    // Get category from slug
    let category = {};
    try {
        const dataCategories = await getCategories(locale, { PostBody: { filter: { [`translation.${locale}.slug`]: slug } } });
        category             = dataCategories.datas.length ? dataCategories.datas[0] : {}; // Normally returns only 1 result
    } catch (err) {
        return { notFound: true };
    }

    // Get cookie server instance
    const cookiesServerInstance = new Cookies(req, res);

    // Get filter from cookie
    const cookieFilter = cookiesServerInstance.get('filter');
    let filter         = {};
    if (cookieFilter) {
        filter = JSON.parse(cookieFilter);
    }

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
            cookiesServerInstance.set('page', JSON.stringify({ id: category._id, page }), { path: '/', httpOnly: false });
        }
    } else {
        const cookiePage = cookiesServerInstance.get('page');
        // If cookie page exists
        if (cookiePage) {
            const dataPage = JSON.parse(cookiePage);
            // We take the value only if category ID matches
            // Otherwise, we delete "page" cookie
            if (dataPage.id === category._id) {
                page = dataPage.page;
            } else {
                unsetCookie('page', cookiesServerInstance);
            }
        }
    }
    
    // Get limit (count of products per pages)
    const limit = 15;

    const actions = [
        {
            type : 'SET_CATEGORY_PAGE',
            value: page
        }, {
            type: 'SET_CATEGORY_PRODUCTS',
            func: getCategoryProducts.bind(this, { id: category._id, postBody: { PostBody: { filter, page, limit } }, lang: locale })
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
    
    pageProps.props.categorySlugs = categorySlugs.join('/');
    pageProps.props.origin        = origin;
    pageProps.props.breadcrumb    = breadcrumb;
    pageProps.props.category      = category;
    pageProps.props.limit         = limit;
    return pageProps;
}

export default function CategoryList({ breadcrumb, category, categorySlugs, limit, origin, error }) {
    const [message, setMessage]                     = useState();
    const { categoryPage, setCategoryPage }         = useCategoryPage();
    const { categoryProducts, setCategoryProducts } = useCategoryProducts();
    const { lang, t }                               = useTranslation();

    const handlePageClick = async (data) => {
        const page = data.selected + 1;

        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
        }

        // Updating the products list
        try {
            const products = await getCategoryProducts({ id: category._id, lang, postBody: { PostBody: { filter, page, limit } } });
            setCategoryProducts(products);

            // Updating category page
            setCategoryPage(page);

            // Setting category page cookie
            document.cookie = 'page=' + JSON.stringify({ id: category._id, page }) + '; path=/;';
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
                title={category.name}
                description={category.metaDescription}
                canonical={`${origin}/c/${categorySlugs}`}
                lang={lang}
                image={`${process.env.NEXT_PUBLIC_IMG_URL}/medias/Logo.jpg`}
            />

            <div dangerouslySetInnerHTML={{
                __html: category.extraText,
            }} />

            <ClickAndCollect />

            <Breadcrumb items={formatBreadcrumb(breadcrumb)} />

            <div className="content-section-carte">
                <div className="container w-container">
                    <p className="paragraph-seo" dangerouslySetInnerHTML={{
                        __html: category.extraText2,
                    }} />
                    <Allergen limit={limit} />
                </div>
                <div className="container-col">

                    <MenuCategories />

                    <div className="tabs w-tabs">
                        <div id="tabs_content" className="tabs-content w-tab-content">
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
                <div className="container w-container">
                    <p className="paragraph-seo" dangerouslySetInnerHTML={{
                        __html: category.extraText3,
                    }} />
                </div>
            </div>
        </Layout>
    );
}
