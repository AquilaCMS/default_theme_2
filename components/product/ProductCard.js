import { useEffect, useRef, useState }                                  from 'react';
import Link                                                             from 'next/link';
import { useRouter }                                                    from 'next/router';
import useTranslation                                                   from 'next-translate/useTranslation';
import { Modal }                                                        from 'react-responsive-modal';
import BundleProduct                                                    from '@components/product/BundleProduct';
import Button                                                           from '@components/ui/Button';
import { downloadFreeVirtualProduct }                                   from '@aquilacms/aquila-connector/api/product';
import { generateSlug, getMainImage }                                   from '@aquilacms/aquila-connector/api/product/helpersProduct';
import { addToCart, deleteCartShipment }                                from '@aquilacms/aquila-connector/api/cart';
import { generateURLImageCache }                                        from '@aquilacms/aquila-connector/lib/utils';
import { useCart, useComponentData, useShowCartSidebar, useSiteConfig } from '@lib/hooks';
import { authProtectedPage, formatPrice, formatStock }                  from '@lib/utils';

import 'react-responsive-modal/styles.css';

export default function ProductCard({ type, value, col = 6, hidden = false }) {
    const [qty, setQty]             = useState(1);
    const [message, setMessage]     = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const productRef                = useRef();
    const timer                     = useRef();
    const { query }                 = useRouter();
    const { cart, setCart }         = useCart();
    const { setShowCartSidebar }    = useShowCartSidebar();
    const { themeConfig }           = useSiteConfig();
    const componentData             = useComponentData();
    const { lang, t }               = useTranslation();

    // 2 options :
    // Live use in code (data in "value" prop => type = "data")
    // Use in CMS block (data in redux store => SET_COMPONENT_DATA => type = "id|code")
    const product = type === 'data' ? value : componentData[`nsProductCard_${type}_${value}`];

    // Getting boolean stock display
    const stockDisplay = themeConfig?.values?.find(t => t.key === 'displayStockCard')?.value !== undefined ? themeConfig?.values?.find(t => t.key === 'displayStockCard')?.value : false;

    useEffect(() => {
        return () => clearTimeout(timer.current);
    }, []);

    if (!product) {
        return <div className="w-dyn-empty">{t('components/product:productCard.noProduct', { product: value })}</div>;
    }

    const currentSlug = generateSlug({
        categorySlugs: query.categorySlugs,
        slug         : product.slug[lang] || '',
        canonical    : product.canonical
    });

    const mainImage = getMainImage(product.images, '250x250');

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
            // Deletion of the cart delivery
            if (cart.delivery?.method) {
                await deleteCartShipment(cart._id);
            }

            // Adding product to cart
            const newCart   = await addToCart(cart._id, product, qty);
            document.cookie = 'cart_id=' + newCart._id + '; path=/;';
            setCart(newCart);
            setShowCartSidebar(true);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            const st      = setTimeout(() => { setMessage(); }, 3000);
            timer.current = st;
        } finally {
            setIsLoading(false);
        }
    };

    const onOpenModal = (e) => {
        e.preventDefault();
        setOpenModal(true);
    };

    const onCloseModal = () => setOpenModal(false);

    const onDownloadVirtualProduct = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const user = await authProtectedPage(document.cookie);
        if (!user) {
            setMessage({ type: 'error', message: t('common:message.loginRequired') });
            const st      = setTimeout(() => { setMessage(); }, 3000);
            timer.current = st;
            setIsLoading(false);
            return;
        }

        try {
            const res  = await downloadFreeVirtualProduct(product._id);
            const url  = URL.createObjectURL(res.data);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = product.code + '.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            const st      = setTimeout(() => { setMessage(); }, 3000);
            timer.current = st;
        } finally {
            setIsLoading(false);
        }
    };

    // Pictos
    const pictos = [];
    if (product.pictos) {
        product.pictos.forEach((picto) => {
            if (pictos.find((p) => p.location === picto.location) !== undefined) {
                pictos.find((p) => p.location === picto.location).pictos.push(picto);
            } else {
                const cardinals = picto.location.split('_');
                const style     = { position: 'absolute', top: 0, left: 0, margin: '5px 0 0 15px' };
                if (cardinals.includes('RIGHT')) {
                    style.left        = 'inherit';
                    style.right       = 0;
                    style.marginRight = '15px';
                }
                if (cardinals.includes('BOTTOM')) {
                    style.top          = 'inherit';
                    style.bottom       = 0;
                    style.marginBottom = '5px';
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

    let bestPrice = 0;
    if (product.variants_values?.length) {
        for (const variant of product.variants_values) {
            if (variant.price.ati.special && (!bestPrice || variant.price.ati.special < bestPrice)) {
                bestPrice = variant.price.ati.special;
            } else if (!bestPrice || variant.price.ati.normal < bestPrice) {
                bestPrice = variant.price.ati.normal;
            }
        }
    }

    return (
        <div role="listitem" ref={productRef} className={`menu-item w-dyn-item w-col w-col-${col}`} style={{ display: hidden ? 'none' : 'block' }}>
            {
                pictos ? pictos.map((picto) => (
                    <div style={picto.style} key={picto.location + Math.random()}>
                        {
                            picto.pictos && picto.pictos.map((p) => <img src={generateURLImageCache('picto', '32x32-70-0,0,0,0', p.pictoId, p.code, p.image)} alt={p.title} title={p.title} key={p._id} />)
                        }
                    </div>
                )) : ''
            }
            <div className="food-card">
                <Link href={currentSlug}>
                    <a className="food-image-square w-inline-block">
                        <img src={mainImage.url || '/images/no-image.svg'} alt={mainImage.alt || 'Image produit'} style={{ 'width': '100%' }} className="food-image" loading="lazy" />
                    </a>
                </Link>
                <div className="food-card-content">
                    <Link href={currentSlug}>
                        <a className="food-title-wrap w-inline-block">
                            <h6 className="heading-9">{product.name}</h6>
                            <div className="div-block-prix">
                                {
                                    product.variants_values?.length ? (
                                        <div className="price">{t('components/product:productCard.from')} {formatPrice(bestPrice)}</div>
                                    ) : (
                                        <>
                                            <div className="price">{ product.price.ati.special ? formatPrice(product.price.ati.special) : formatPrice(product.price.ati.normal) }</div>
                                            { product.price.ati.special ? <div className="price sale">{formatPrice(product.price.ati.normal)}</div> : null }
                                        </>
                                    )
                                }
                            </div>
                        </a>
                    </Link>
                    <p className="paragraph">{product.description2?.title}</p>
                    <div className="add-to-cart">
                        {
                            message ? (
                                <div className={`w-commerce-commerce${message.type}`}>
                                    <div>
                                        {message.message}
                                    </div>
                                </div>
                            ) : (
                                product.variants_values?.length ? (
                                    <div className="w-commerce-commerceaddtocartform default-state">
                                        <Link href={currentSlug}>
                                            <a className="w-commerce-commerceaddtocartbutton order-button">{t('components/product:productCard.choose')}</a>
                                        </Link>
                                    </div>
                                ) : (
                                    <form className="w-commerce-commerceaddtocartform default-state" onSubmit={product.type === 'virtual' && product.price.ati.normal === 0 ? onDownloadVirtualProduct : (product.type === 'bundle' ? onOpenModal : onAddToCart)}>
                                        <input type="number" min={1} disabled={product.type === 'virtual'} className="w-commerce-commerceaddtocartquantityinput quantity" value={qty} onChange={onChangeQty} onWheel={(e) => e.target.blur()} />
                                        <Button 
                                            text={product.type === 'virtual' && product.price.ati.normal === 0 ? t('components/product:productCard.download') : (product.type === 'bundle' ? t('components/product:productCard.compose') : t('components/product:productCard.addToBasket'))}
                                            loadingText={product.type === 'virtual' && product.price.ati.normal === 0 ? t('components/product:productCard.downloading') : t('components/product:productCard.addToCartLoading')}
                                            isLoading={isLoading}
                                            className="w-commerce-commerceaddtocartbutton order-button"
                                        />
                                    </form>
                                )
                            )
                        }
                    </div>
                    {
                        !product.variants_values?.length && stockDisplay && (
                            <div style={{ textAlign: 'right' }}>
                                { formatStock(product.stock) }
                            </div>
                        )
                    }
                </div>
            </div>
            {
                product.type === 'bundle' && (
                    <Modal open={openModal} onClose={onCloseModal} center classNames={{ modal: 'bundle-content' }}>
                        <BundleProduct product={product} qty={qty} onCloseModal={onCloseModal} />
                    </Modal>
                )
            }
        </div>


    );
}