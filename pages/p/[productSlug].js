import { useState }                                from 'react';
import { ProductJsonLd }                           from 'next-seo';
import { useRouter }                               from 'next/router';
import getT                                        from 'next-translate/getT';
import useTranslation                              from 'next-translate/useTranslation';
import { Modal }                                   from 'react-responsive-modal';
import ErrorPage                                   from '@pages/_error';
import BundleProduct                               from '@components/product/BundleProduct';
import Layout                                      from '@components/layouts/Layout';
import NextSeoCustom                               from '@components/tools/NextSeoCustom';
import Breadcrumb                                  from '@components/navigation/Breadcrumb';
import ProductList                                 from '@components/product/ProductList';
import BlockCMS                                    from '@components/common/BlockCMS';
import Button                                      from '@components/ui/Button';
import { dispatcher }                              from '@lib/redux/dispatcher';
import { getBlocksCMS }                            from '@lib/aquila-connector/blockcms';
import { getBreadcrumb }                           from '@lib/aquila-connector/breadcrumb';
import { addToCart }                               from '@lib/aquila-connector/cart';
import { getProduct }                              from '@lib/aquila-connector/product/providerProduct';
import { getImage, getMainImage, getTabImageURL }  from '@lib/aquila-connector/product/helpersProduct';
import { formatBreadcrumb }                        from '@lib/utils';
import { useCart, useProduct, useShowCartSidebar } from '@lib/hooks';
import Lightbox                                    from 'lightbox-react';
import 'lightbox-react/style.css';

export async function getServerSideProps({ locale, params, req, res }) {
    const actions = [
        {
            type: 'SET_PRODUCT',
            func: getProduct.bind(this, params.productSlug)
        },
        {
            type: 'PUSH_CMSBLOCKS',
            func: getBlocksCMS.bind(this, ['info-bottom-1'])
        }
    ];

    const pageProps = await dispatcher(req, res, actions);
    let breadcrumb  = [];
    try {
        breadcrumb = await getBreadcrumb(pageProps.props.initialReduxState.product.canonical);
    } catch (err) {
        const t = await getT(locale, 'common');
        console.error(err.message || t('common:message.unknownError'));
    }
    pageProps.props.breadcrumb = breadcrumb;
    return pageProps;
}

export default function CategoryList({ breadcrumb }) {
    const [qty, setQty]               = useState(1);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [isOpen, setIsOpen]         = useState(false);
    const [message, setMessage]       = useState();
    const [isLoading, setIsLoading]   = useState(false);
    const [openModal, setOpenModal]   = useState(false);
    const { cart, setCart }           = useCart();
    const product                     = useProduct();
    const { lang, t }                 = useTranslation();
    const { setShowCartSidebar }      = useShowCartSidebar();
    const router                      = useRouter();

    if (!product) return <ErrorPage statusCode={404} />;

    const coverImageUrl = getMainImage(product.images, '578x578') || '/images/no-image.svg';

    const onChangeQty = (e) => {
        if (!e.target.value) {
            return setQty('');
        } else {
            const quantity = Number(e.target.value);
            if (quantity < 1) {
                return setQty(1);
            }
            setQty(quantity);
        }
    };

    const onAddToCart = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            setMessage();
            const newCart   = await addToCart(cart._id, product, qty);
            document.cookie = 'cart_id=' + newCart._id + '; path=/;';
            setCart(newCart);
            setShowCartSidebar(true);
            document.body.style.overflow = 'hidden';
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    const openLightBox = (i) => {
        setPhotoIndex(i);
        setIsOpen(true);
    };

    const previousStep = () => {
        router.back();
    };

    const onOpenModal = (e) => {
        e.preventDefault();
        setOpenModal(true);
    };

    const onCloseModal = () => setOpenModal(false);

    return (

        <Layout>

            <div className="header-section product">
                <div className="container-flex-2">
                    <h1 className="header-h1">
                        {product.name}
                    </h1>
                </div>
            </div>

            <Breadcrumb items={formatBreadcrumb(breadcrumb)} />

            <div className="content-section-short-product">
                <button type="button" className="button bottomspace w-button" onClick={previousStep}>{t('components/product:product.return')}</button>
                <div className="container-product">
                    <div className="w-layout-grid product-grid">
                        <div className="product-image-wrapper">
                            {
                                isOpen && (
                                    <Lightbox
                                        mainSrc={`${process.env.NEXT_PUBLIC_IMG_URL}/images/products/max/${product.images[photoIndex]._id}/${product.images[photoIndex].name}`}
                                        nextSrc={`${process.env.NEXT_PUBLIC_IMG_URL}/images/products/max/${product.images[(photoIndex + 1) % product.images.length]._id}/${product.images[(photoIndex + 1) % product.images.length].name}`}
                                        prevSrc={`${process.env.NEXT_PUBLIC_IMG_URL}/images/products/max/${product.images[(photoIndex + product.images.length - 1) % product.images.length]._id}/${product.images[(photoIndex + product.images.length - 1) % product.images.length].name}`}
                                        imageTitle={product.images[photoIndex].alt}
                                        onCloseRequest={() => setIsOpen(false)}
                                        onMovePrevRequest={() => setPhotoIndex((photoIndex + product.images.length - 1) % product.images.length)}
                                        onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % product.images.length)}
                                    />
                                )
                            }
                            <div className="lightbox-link w-inline-block w-lightbox" style={{ cursor: 'pointer' }}>
                                <img loading="lazy" src={coverImageUrl} alt={product.name || 'Image produit'} className="product-image" onClick={() => (product.images.length ? openLightBox(product.images.findIndex((img) => img.default)) : false)} />
                            </div>
                            <div className="collection-list-wrapper w-dyn-list">
                                <div role="list" className="collection-list w-clearfix w-dyn-items">
                                    {product.images?.filter(ou => !ou.default).map((item) => (
                                        <div key={item._id} role="listitem" className="collection-item w-dyn-item">
                                            <div className="w-inline-block w-lightbox" style={{ cursor: 'pointer' }} onClick={() => openLightBox(product.images.findIndex((im) => im._id === item._id))}>
                                                <img loading="lazy" src={getImage(item, '75x75')} alt={item.alt || 'Image produit'} className="more-image" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="product-content">
                            <h3>{product.description2?.title}</h3>
                            <div className="div-block-prix">
                                <div className="price-text">{ product.price.ati.special ? product.price.ati.special.toFixed(2) : product.price.ati.normal.toFixed(2) } €</div>
                                { product.price.ati.special ? <div className="price-text sale">{product.price.ati.normal.toFixed(2)} €</div> : null }
                            </div>
                            <div className="plain-line" />
                            <div className="full-details w-richtext"><p dangerouslySetInnerHTML={{ __html: product.description2?.text }} /></div>
                            <div>
                                <form className="w-commerce-commerceaddtocartform default-state" onSubmit={product.type === 'bundle' ? onOpenModal : onAddToCart}>
                                    <input type="number" min={1} className="w-commerce-commerceaddtocartquantityinput quantity" value={qty} onChange={onChangeQty} />
                                    <Button 
                                        text={product.type === 'simple' ? t('components/product:product.addToBasket') : t('components/product:product.compose')}
                                        loadingText={t('components/product:product.addToCartLoading')}
                                        isLoading={isLoading}
                                        disabled={product.type === 'virtual'} 
                                        className="w-commerce-commerceaddtocartbutton order-button"
                                    />
                                </form>
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
                                <div>{t('components/product:product.tab1')}</div>
                            </a>
                            <a className="tab-link-round w-inline-block w-tab-link">
                                <div>{t('components/product:product.tab2')}</div>
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
                            <h3 className="header-h4">{t('components/product:product.otherProducts')}</h3>
                        </div>

                        <div className="w-dyn-list">
                            <ProductList
                                productsList={product.associated_prds}
                            />
                        </div>
                    </div>
                </div>
            }

            <BlockCMS nsCode="info-bottom-1" /> {/* TODO : il faudrait afficher le contenu d'une description de la catégorie rattachée ! */}

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

            <Modal open={openModal} onClose={onCloseModal} center classNames={{ modal: 'faq-content' }} styles={{ modal: { maxWidth: '1130px', maxHeight: 'none' } }}>
                <BundleProduct product={product} qty={qty} onCloseModal={onCloseModal} />
            </Modal>

        </Layout>

    );
}
