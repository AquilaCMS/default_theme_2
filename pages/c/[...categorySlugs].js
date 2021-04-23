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
import { getCategories, getCategoryProducts } from '@lib/aquila-connector/category';
import { useCategory, useCategoryProducts }   from '@lib/hooks';

export async function getServerSideProps({ params }) {
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
    return dispatcher(actions);
}

export default function CategoryList({ error }) {
    const { lang }             = useTranslation();
    const { category }         = useCategory();
    const { categoryProducts } = useCategoryProducts();

    if(error) {
        return <Error statusCode={error.code} />;
    }

    return (
        <Layout>

            <div dangerouslySetInnerHTML={{
                __html: category.extraText,
            }} />

            <ClickAndCollect />

            <Breadcrumb />

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
