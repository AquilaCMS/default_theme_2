import { useState }                                    from 'react';
import { ProductJsonLd }                               from 'next-seo';
import absoluteUrl                                     from 'next-absolute-url';
import { useRouter }                                   from 'next/router';
import getT                                            from 'next-translate/getT';
import useTranslation                                  from 'next-translate/useTranslation';
import { Modal }                                       from 'react-responsive-modal';
import Lightbox                                        from 'lightbox-react';
import ErrorPage                                       from '@pages/_error';
import BundleProduct                                   from '@components/product/BundleProduct';
import Layout                                          from '@components/layouts/Layout';
import NextSeoCustom                                   from '@components/tools/NextSeoCustom';
import Breadcrumb                                      from '@components/navigation/Breadcrumb';
import ProductList                                     from '@components/product/ProductList';
import BlockCMS                                        from '@components/common/BlockCMS';
import Button                                          from '@components/ui/Button';
import { dispatcher }                                  from '@lib/redux/dispatcher';
import { getBlocksCMS }                                from 'aquila-connector/api/blockcms';
import { getBreadcrumb }                               from 'aquila-connector/api/breadcrumb';
import { addToCart }                                   from 'aquila-connector/api/cart';
import { getCategories }                               from 'aquila-connector/api/category';
import { getProduct }                                  from 'aquila-connector/api/product';
import { getImage, getMainImage, getTabImageURL }      from 'aquila-connector/api/product/helpersProduct';
import { useCart, useShowCartSidebar }                 from '@lib/hooks';
import { setLangAxios, formatBreadcrumb, formatPrice } from '@lib/utils';

import 'lightbox-react/style.css';
import 'react-responsive-modal/styles.css';

export async function getServerSideProps({ locale, params, req, res, resolvedUrl }) {
    setLangAxios(locale, req, res);

    const productSlug   = params.productSlug.pop();
    const categorySlugs = params.productSlug;

    // Get category from slug
    let categories = [];
    let product    = {};
    try {
        const dataCategories = await getCategories(locale, { PostBody: { filter: { [`translation.${locale}.slug`]: { $in: categorySlugs } }, limit: 9999 } });
        categories           = dataCategories.datas;
        product              = await getProduct('slug', productSlug, locale);
    } catch (err) {
        return { notFound: true };
    }

    if (!product) {
        return { notFound: true };
    }

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
    for (const [lang, sl] of Object.entries(product.slug)) {
        slugsLangs[lang].push(sl);
    }
    for (const [lang, sl] of Object.entries(slugsLangs)) {
        urlsLanguages.push({ lang, url: `/${sl.join('/')}` });
    }

    const actions = [
        {
            type: 'PUSH_CMSBLOCKS',
            func: getBlocksCMS.bind(this, ['info-bottom-1'], locale)
        }, {
            type : 'SET_URLS_LANGUAGES',
            value: urlsLanguages
        }
    ];

    const pageProps = await dispatcher(locale, req, res, actions);

    // Breadcrumb
    let breadcrumb = [];
    try {
        breadcrumb = await getBreadcrumb(resolvedUrl);
    } catch (err) {
        const t = await getT(locale, 'common');
        console.error(err.message || t('common:message.unknownError'));
    }
    pageProps.props.breadcrumb = breadcrumb;

    // URL origin
    const { origin }        = absoluteUrl(req);
    pageProps.props.origin  = origin;
    pageProps.props.product = product;

    return pageProps;
}

export default function Product({ breadcrumb, origin, product }) {
    const [qty, setQty]               = useState(1);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [isOpen, setIsOpen]         = useState(false);
    const [message, setMessage]       = useState();
    const [isLoading, setIsLoading]   = useState(false);
    const [openModal, setOpenModal]   = useState(false);
    const [tabs, setTabs]             = useState(0);
    const { cart, setCart }           = useCart();
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

    // Pictos
    const pictos = [];
    if (product.pictos) {
        product.pictos.forEach((picto) => {
            if (pictos.find((p) => p.location === picto.location) !== undefined) {
                pictos.find((p) => p.location === picto.location).pictos.push(picto);
            } else {
                const cardinals = picto.location.split('_');
                const style     = { position: 'absolute', top: 0, left: 0 };
                if (cardinals.includes('RIGHT')) {
                    style.left  = 'inherit';
                    style.right = 0;
                }
                if (cardinals.includes('BOTTOM')) {
                    style.top    = 'inherit';
                    style.bottom = 0;
                }
                if (cardinals.includes('CENTER')) {
                    style.left      = '50%';
                    style.transform = 'translate(-50%, 0)';
                }
                if (cardinals.includes('MIDDLE')) {
                    style.top       = '50%';
                    style.transform = 'translate(0, -50%)';
                }
                pictos.push({ location: picto.location, style, pictos: [picto] });
            }
        });
    }

    return (

        <Layout>
            <NextSeoCustom
                title={product.name}
                description={product?.description2?.text}
                canonical={origin + product.canonical}
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
                                        mainSrc={`/images/products/max/${product.images[photoIndex]._id}/${product.images[photoIndex].name}`}
                                        nextSrc={`/images/products/max/${product.images[(photoIndex + 1) % product.images.length]._id}/${product.images[(photoIndex + 1) % product.images.length].name}`}
                                        prevSrc={`/images/products/max/${product.images[(photoIndex + product.images.length - 1) % product.images.length]._id}/${product.images[(photoIndex + product.images.length - 1) % product.images.length].name}`}
                                        imageTitle={product.images[photoIndex].alt}
                                        onCloseRequest={() => setIsOpen(false)}
                                        onMovePrevRequest={() => setPhotoIndex((photoIndex + product.images.length - 1) % product.images.length)}
                                        onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % product.images.length)}
                                    />
                                )
                            }
                            <div className="lightbox-link w-inline-block w-lightbox" style={{ position: 'relative', cursor: 'pointer' }}>
                                {
                                    pictos ? pictos.map((picto) => (
                                        <div style={picto.style} key={picto.location + Math.random()}>
                                            {
                                                picto.pictos && picto.pictos.map((p) => <img src={`/images/picto/64x64-70-0,0,0,0/${p.pictoId}/${p.image}`} alt={p.title} title={p.title} key={p._id} />)
                                            }
                                        </div>
                                    )) : ''
                                }
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
                                <div className="price-text">{ product.price.ati.special ? formatPrice(product.price.ati.special) : formatPrice(product.price.ati.normal) }</div>
                                { product.price.ati.special ? <div className="price-text sale">{formatPrice(product.price.ati.normal)}</div> : null }
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
                            <a className={`tab-link-round w-inline-block w-tab-link${tabs === 0 ? ' w--current' : ''}`} onClick={() => setTabs(0)}>
                                <div>{t('components/product:product.tab1')}</div>
                            </a>
                            {
                                product.allergens?.length > 0 && (
                                    <a className={`tab-link-round w-inline-block w-tab-link${tabs === 1 ? ' w--current' : ''}`} onClick={() => setTabs(1)}>
                                        <div>{t('components/product:product.tab2')}</div>
                                    </a>
                                )
                            }
                            {/* <a className="tab-link-round w-inline-block w-tab-link w--current">
                                <div>Reviews (0)</div>
                            </a> */}
                        </div>
                        <div className="w-tab-content">
                            <div className={`w-tab-pane${tabs === 0 ? ' w--tab-active' : ''}`} dangerouslySetInnerHTML={{ __html: product.description1?.text }} />
                            {
                                product.allergens?.length > 0 && (
                                    <div className={`w-tab-pane${tabs === 1 ? ' w--tab-active' : ''}`}>
                                        <table>
                                            {
                                                product.allergens.map((allergen) => {
                                                    return (
                                                        <tr key={allergen._id}>
                                                            <td style={{ padding: '10px' }}>
                                                                <img src={allergen.image} alt={allergen.code} />
                                                            </td>
                                                            <td style={{ padding: '10px' }}>{allergen.name}</td>
                                                        </tr>
                                                    );
                                                })
                                            }    
                                        </table>
                                    </div>
                                )
                            }
                            
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
                            <ProductList type="data" value={product.associated_prds} />
                        </div>
                    </div>
                </div>
            }

            <BlockCMS nsCode="info-bottom-1" /> {/* TODO : il faudrait afficher le contenu d'une description de la catégorie rattachée ! */}

            <Modal open={openModal} onClose={onCloseModal} center classNames={{ modal: 'bundle-content' }}>
                <BundleProduct product={product} qty={qty} onCloseModal={onCloseModal} />
            </Modal>

        </Layout>

    );
}