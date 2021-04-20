import { useEffect, useState }                    from 'react';
import { ProductJsonLd }                          from 'next-seo';
import cookie                                     from 'cookie';
import useTranslation                             from 'next-translate/useTranslation';
import ErrorPage                                  from '@pages/_error';
import Layout                                     from '@components/layouts/Layout';
import NextSeoCustom                              from '@components/tools/NextSeoCustom';
import Breadcrumb                                 from '@components/navigation/Breadcrumb';
import ProductList                                from '@components/product/ProductList';
import BlockCMS                                   from '@components/common/BlockCMS';
import { dispatcher }                             from '@lib/redux/dispatcher';
import blockCMSProvider                           from '@lib/aquila-connector/blockcms';
import { addToCart }                              from '@lib/aquila-connector/cart';
import productProvider                            from '@lib/aquila-connector/product/providerProduct';
import { getImage, getMainImage, getTabImageURL } from '@lib/aquila-connector/product/helpersProduct';
import { useProduct, useShowCartSidebar }         from '@lib/hooks';

export async function getServerSideProps({ params }) {
    const actions = [
        {
            type: 'SET_PRODUCT',
            func: productProvider.getProduct.bind(this, params.productSlug)
        },
        {
            type: 'PUSH_CMSBLOCKS',
            func: blockCMSProvider.getBlocksCMS.bind(this, ['info-bottom-1'])
        }
    ];

    return dispatcher(actions);
}

export default function CategoryList() {
    const [qty, setQty]          = useState(1);
    const [cartid, setCartid]    = useState();
    const { product }            = useProduct();
    const { setShowCartSidebar } = useShowCartSidebar();
    const { lang }               = useTranslation();

    if (!product) return <ErrorPage statusCode={404} />;

    const coverImageUrl = getMainImage(product.images, '578x578') || '/images/no-image.svg';

    const breadcrumb = [{
        position: 1,
        name    : 'TODO',
        item    : '/TODO'
    }, {
        position: 2,
        name    : product.name,
        item    : product.canonical
    }];

    useEffect(() => {
        setCartid(cookie.parse(document.cookie).cart_id);
    });

    const onChangeQty = (e) => {
        setQty(Number(e.target.value));
    };

    const onAddToCart = async (e) => {
        e.preventDefault();
        const newCart   = await addToCart(cartid, product, qty);
        document.cookie = 'cart_id=' + newCart._id + '; path=/;';
        document.cookie = 'count_cart=' + newCart.items.length + '; path=/;';
        setShowCartSidebar(true);
    };

    return (

        <Layout>

            <div className="header-section product">
                <div className="container-flex-2">
                    <h1 className="header-h1">
                        {product.name}
                    </h1>
                </div>
            </div>

            <Breadcrumb items={breadcrumb} />

            <div className="content-section-short-product">
                <a href="order.html" className="button bottomspace w-button">Retour</a>
                <div className="container-product">
                    <div className="w-layout-grid product-grid">
                        <div className="product-image-wrapper">
                            <a href="#" className="lightbox-link w-inline-block w-lightbox">
                                <img loading="lazy" src={coverImageUrl} alt={product.name || 'Image produit'} className="product-image" />
                            </a>
                            <div className="collection-list-wrapper w-dyn-list">
                                <div role="list" className="collection-list w-clearfix w-dyn-items">
                                    {product.images?.filter(ou => !ou.default).map((item) => (
                                        <div key={item._id} role="listitem" className="collection-item w-dyn-item">
                                            <a href="#" className="w-inline-block w-lightbox">
                                                <img loading="lazy" src={getImage(item, '75x75')} alt={item.alt || 'Image produit'} className="more-image" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                {/* <div className="w-dyn-empty">
                                    <div>No items found.</div>
                                </div> */}
                            </div>
                        </div>
                        <div className="product-content">
                            <h3>{product.description2?.title}</h3>
                            <div className="div-block-prix">
                                <div className="price-text">{product.price?.ati?.normal?.toFixed(2)} €</div>
                                <div className="price-text sale" />
                            </div>
                            <div className="plain-line" />
                            <div className="full-details w-richtext"><p dangerouslySetInnerHTML={{ __html: product.description2?.text }} /></div>
                            <div>
                                <form className="w-commerce-commerceaddtocartform default-state">
                                    <input type="number" min={1} className="w-commerce-commerceaddtocartquantityinput quantity" value={qty} onChange={onChangeQty} />
                                    <button type="button" disabled={product.type !== 'simple'} className="w-commerce-commerceaddtocartbutton order-button" onClick={onAddToCart}>{product.type === 'simple' ? 'Ajouter au panier' : 'Composer'}</button>
                                </form>
                                <div style={{ display: 'none' }} className="w-commerce-commerceaddtocartoutofstock out-of-stock-state">
                                    <div>This product is out of stock.</div>
                                </div>
                                <div style={{ display: 'none' }} className="w-commerce-commerceaddtocarterror">
                                    <div >Product is not available in this quantity.</div>
                                </div>
                            </div>
                            <div className="plain-line" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-section-bg">
                <div className="container-tight">
                    <div className="w-tabs">
                        <div className="tab-menu w-tab-menu">
                            <a className="tab-link-round w-inline-block w-tab-link  w--current">
                                <div>Description</div>
                            </a>
                            <a className="tab-link-round w-inline-block w-tab-link">
                                <div>Informations sur les allergènes</div>
                            </a>
                            {/* <a className="tab-link-round w-inline-block w-tab-link w--current">
                                <div>Reviews (0)</div>
                            </a> */}
                        </div>
                        <div className="w-tab-content">
                            <p dangerouslySetInnerHTML={{ __html: product.description1?.text }} />
                            {/* <div className="w-tab-pane">
                                <div className="additional-details w-richtext" />
                            </div>
                            <div className="w-tab-pane">
                                <div className="additional-details w-richtext" />
                            </div>
                            <div className="w-tab-pane w--tab-active">
                                <div className="additional-details w-richtext" />
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            {product.associated_prds?.length > 0 &&
                <div className="content-section-short">
                    <div className="container">
                        <div className="title-wrap-centre">
                            <h3 className="header-h4">Produits complémentaires</h3>
                        </div>

                        <div className="w-dyn-list">
                            <ProductList
                                productsList={product.associated_prds}
                            />
                        </div>
                    </div>
                </div>
            }

            <BlockCMS nsCode="info-bottom-1" />


            <NextSeoCustom
                title={product.name}
                description={product?.description2?.text}
                canonical={product.canonical}
                lang={lang}
                image={coverImageUrl}
            />

            <ProductJsonLd
                productName={product.name}
                images={getTabImageURL(product.images)}
                description={product?.description2?.text}
                // brand="TODO"
                //     reviews={[
                //         {
                //             author: {
                //                 type: 'Person',
                //                 name: 'Jim',
                //             },
                //             datePublished: '2017-01-06T03:37:40Z',
                //             reviewBody   :
                // 'This is my favorite product yet! Thanks Nate for the example products and reviews.',
                //             name        : 'So awesome!!!',
                //             reviewRating: {
                //                 bestRating : '5',
                //                 ratingValue: '5',
                //                 worstRating: '1',
                //             },
                //             publisher: {
                //                 type: 'Organization',
                //                 name: 'TwoVit',
                //             },
                //         },
                //     ]}
                //     aggregateRating={{
                //         ratingValue: '4.4',
                //         reviewCount: '89',
                //     }}
                offers={[
                    {
                        price        : product.price?.ati?.special ? product.price.ati.special : product.price?.ati.normal,
                        priceCurrency: 'EUR',
                        itemCondition: 'https://schema.org/NewCondition',
                        availability : 'https://schema.org/InStock',
                        url          : product.canonical
                    }
                ]}
            />

        </Layout>

    );
}
