import getT                                   from 'next-translate/getT';
import useTranslation                         from 'next-translate/useTranslation';
import Error                                  from '@pages/_error';
import Layout                                 from '@components/layouts/Layout';
import NextSeoCustom                          from '@components/tools/NextSeoCustom';
import Breadcrumb                             from '@components/navigation/Breadcrumb';
import ProductList                            from '@components/product/ProductList';
import MenuCategories                         from '@components/navigation/MenuCategories';
import ClickAndCollect                        from '@components/modules/ClickAndCollect';
import Allergen                               from '@components/modules/Allergen';
import { dispatcher }                         from '@lib/redux/dispatcher';
import { getBreadcrumb }                      from '@lib/aquila-connector/breadcrumb';
import { getCategories, getCategoryProducts } from '@lib/aquila-connector/category';
import { formatBreadcrumb }                   from '@lib/utils';
import { useCategory, useCategoryProducts }   from '@lib/hooks';

export async function getServerSideProps({ locale, params, resolvedUrl }) {
    const categorySlugs = Array.isArray(params.categorySlugs) ? params.categorySlugs : [params.categorySlugs];
    const slug          = categorySlugs[categorySlugs.length - 1];
    // TODO : SET_CATEGORY & SET_CATEGORY_PRODUCTS sont appelé l'un apres l'autre, donc la route "SET_CATEGORY" est appelé 2 fois (puisqu'appelé via SET_CATEGORY_PRODUCTS)
    const actions = [
        {
            type: 'SET_CATEGORY',
            func: getCategories.bind(this, { PostBody: { filter: { 'translation.fr.slug': slug } } })
        },
        {
            type: 'SET_CATEGORY_PRODUCTS',
            func: getCategoryProducts.bind(this, { slug })
        }
    ];

    const pageProps = await dispatcher(actions);
    let breadcrumb  = [];
    try {
        breadcrumb = await getBreadcrumb(resolvedUrl);
    } catch (err) {
        const t = await getT(locale, 'common');
        console.error(err.message || t('common:message.unknownError'));
    }
    pageProps.props.breadcrumb = breadcrumb;
    return pageProps;
}

export default function CategoryList({ breadcrumb, error }) {
    const { lang }         = useTranslation();
    const category         = useCategory();
    const categoryProducts = useCategoryProducts();

    if (error) {
        return <Error statusCode={error.code} />;
    }

    return (
        <Layout>

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
                    <Allergen />
                </div>
                <div className="container-col">

                    <MenuCategories />

                    <div className="tabs w-tabs">
                        <div id="tabs_content" className="tabs-content w-tab-content">
                            <div className="tab-pane-wrap w-tab-pane w--tab-active">
                                <div className="w-dyn-list">
                                    <ProductList
                                        productsList={categoryProducts.datas}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container w-container">
                <p className="paragraph-seo" dangerouslySetInnerHTML={{
                    __html: category.extraText3,
                }} />
            </div>


            <NextSeoCustom
                title={category.name}
                description={category.metaDescription}
                canonical="TODO"
                lang={lang}
                image={`${process.env.NEXT_PUBLIC_IMG_URL}/medias/Logo.jpg`}
            />

        </Layout>
    );
}
