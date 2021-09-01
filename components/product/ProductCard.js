import { useEffect, useRef, useState }                   from 'react';
import Link                                              from 'next/link';
import { useRouter }                                     from 'next/router';
import useTranslation                                    from 'next-translate/useTranslation';
import { Modal }                                         from 'react-responsive-modal';
import BundleProduct                                     from '@components/product/BundleProduct';
import Button                                            from '@components/ui/Button';
import { generateSlug, getImage }                        from 'aquila-connector/api/product/helpersProduct';
import { addToCart }                                     from 'aquila-connector/api/cart';
import { useCart, useComponentData, useShowCartSidebar } from '@lib/hooks';
import { formatPrice }                                   from '@lib/utils';

import 'react-responsive-modal/styles.css';

export default function ProductCard({ type, value, col = 6 }) {
    const [qty, setQty]             = useState(1);
    const [message, setMessage]     = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const timer                     = useRef();
    const { query }                 = useRouter();
    const { cart, setCart }         = useCart();
    const { setShowCartSidebar }    = useShowCartSidebar();
    const componentData             = useComponentData();
    const { lang, t }               = useTranslation();

    // 2 options :
    // Live use in code (data in "value" prop => type = "data")
    // Use in CMS block (data in redux store => SET_COMPONENT_DATA => type = "id|code")
    const product = type === 'data' ? value : componentData[`nsProductCard_${type}_${value}`];

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

    return (
        <div role="listitem" className={`menu-item w-dyn-item w-col w-col-${col}`}>
            {
                pictos ? pictos.map((picto) => (
                    <div style={picto.style} key={picto.location + Math.random()}>
                        {
                            picto.pictos && picto.pictos.map((p) => <img src={`${process.env.NEXT_PUBLIC_IMG_URL}/images/picto/32x32-70-0,0,0,0/${p.pictoId}/${p.image}`} alt={p.title} title={p.title} key={p._id} />)
                        }
                    </div>
                )) : ''
            }
            <div className="food-card">
                <Link href={currentSlug}>
                    <a className="food-image-square w-inline-block">
                        <img src={getImage(product.images[0], '250x250') || '/images/no-image.svg'} alt={product.name || 'Image produit'} style={{ 'width': '100%' }} className="food-image" loading="lazy" />
                    </a>
                </Link>
                <div className="food-card-content">
                    <Link href={currentSlug}>
                        <a className="food-title-wrap w-inline-block">
                            <h6 className="heading-9" >{product.name}</h6>
                            <div className="div-block-prix">
                                <div className="price">{ product.price.ati.special ? formatPrice(product.price.ati.special) : formatPrice(product.price.ati.normal) }</div>
                                { product.price.ati.special ? <div className="price sale">{formatPrice(product.price.ati.normal)}</div> : null }
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
                                <form className="w-commerce-commerceaddtocartform default-state" onSubmit={product.type === 'bundle' ? onOpenModal : onAddToCart}>
                                    <input type="number" disabled={product.type === 'virtual'} className="w-commerce-commerceaddtocartquantityinput quantity" value={qty} onChange={onChangeQty} />
                                    <Button 
                                        text={product.type === 'simple' ? t('components/product:productCard.addToBasket') : t('components/product:productCard.compose')}
                                        loadingText={t('components/product:productCard.addToCartLoading')}
                                        isLoading={isLoading}
                                        disabled={product.type === 'virtual'}
                                        className="w-commerce-commerceaddtocartbutton order-button"
                                    />
                                </form>
                            )
                        }
                    </div>
                </div>
            </div>
            <Modal open={openModal} onClose={onCloseModal} center classNames={{ modal: 'bundle-content' }}>
                <BundleProduct product={product} qty={qty} onCloseModal={onCloseModal} />
            </Modal>
        </div>


    );
}