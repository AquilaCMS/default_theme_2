import useTranslation   from 'next-translate/useTranslation';
import { useSelector }  from 'react-redux';
import Layout           from '@components/layouts/Layout';
import NextSeoCustom    from '@components/tools/NextSeoCustom';
import ProductList      from '@components/product/ProductList';
import BlockSlider      from '@components/common/BlockSlider';
import BlockCMS         from '@components/common/BlockCMS';
import { dispatcher }   from '@lib/redux/dispatcher';
import productProvider  from '@lib/aquila-connector/product/providerProduct';
import blockCMSProvider from '@lib/aquila-connector/blockcms/index';

const getStoreData = () => {
    const products = useSelector((state) => state.products);
    return { products };
};

const getBlocksCMS = async () => {
    const blockCMSCode = ['home-bottom-faq', 'home-bottom-call', 'info-bottom-1', 'home-promote-product-1', 'home-promote-product-2', 'Slide-Home-1', 'Slide-Home-2', 'Slide-Home-3'];
    return blockCMSProvider.getBlocksCMS(blockCMSCode);
};

export async function getServerSideProps({ req, res }) {
    const actions = [
        {
            type: 'SET_PRODUCTS',
            func: productProvider.getProductsFromCategory.bind(this)
        },
        {
            type: 'PUSH_CMSBLOCKS',
            func: getBlocksCMS.bind(this)
        }
    ];
    return dispatcher(req, res, actions);
}

export default function Home() {

    const { lang }      = useTranslation();
    const { products }  = getStoreData();
    const TMP_title     = 'TODO';
    const TMP_desc      = 'TODO';
    const TMP_canonical = 'TODO';

    return (
        <Layout>
            
            <BlockSlider nsCodeList={['Slide-Home-1', 'Slide-Home-2', 'Slide-Home-3']} />

            <BlockCMS nsCode="home-promote-product-1" />
            <BlockCMS nsCode="home-promote-product-2" />

            <div className="content-section-bg">
                <div className="container-col">
                    <div className="title-wrap-centre">
                        <h2 className="heading-2-steps">Découvrez notre carte</h2>
                        <p>Choisissez dans notre carte et offres du jour,<br />Et récupéré votre commande</p>
                    </div>

                    {products && products.datas && products.datas.length > 0 && /* Ne reprend pas le design d'origine : liste de produit à mettre en avant */
                        <div className="tabs w-tabs">
                            <div id="tabs_content" className="tabs-content w-tab-content">
                                <div className="tab-pane-wrap w-tab-pane w--tab-active">
                                    <div className="w-dyn-list">
                                        <ProductList
                                            productsList={products.datas}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    {/* <div className="button-wrapper">
                        <a href="/category" className="button w-button">Voir la Carte</a>
                    </div> */}
                </div>
            </div>

            <BlockCMS nsCode="home-bottom-faq" />
            <BlockCMS nsCode="home-bottom-call" />
            <BlockCMS nsCode="info-bottom-1" />


            <NextSeoCustom
                title={TMP_title}
                description={TMP_desc}
                canonical={TMP_canonical}
                lang={lang}
                image='/images/monrestaurant-logo.jpg'
            />

        </Layout>
    );
}
