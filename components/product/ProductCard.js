import { useEffect, useRef, useState } from 'react';
import Link                            from 'next/link';
import { useRouter }                   from 'next/router';
import useTranslation                  from 'next-translate/useTranslation';
import { Modal }                       from 'react-responsive-modal';
import BundleProduct                   from '@components/product/BundleProduct';
import Button                          from '@components/ui/Button';
import { generateSlug }                from '@lib/aquila-connector/product/helpersProduct';
import { addToCart }                   from '@lib/aquila-connector/cart';
import { useCart, useShowCartSidebar } from '@lib/hooks';
import { formatPrice }                 from '@lib/utils';

import 'react-responsive-modal/styles.css';

export default function ProductCard({ product }) {
    const [qty, setQty]             = useState(1);
    const [message, setMessage]     = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const timer                     = useRef();
    const { query }                 = useRouter();
    const { cart, setCart }         = useCart();
    const { setShowCartSidebar }    = useShowCartSidebar();
    const { t }                     = useTranslation();
    
    const { slug, name, description, img, canonical } = product;

    const currentSlug = generateSlug({
        categorySlugs: query.categorySlugs,
        slug,
        canonical
    });

    useEffect(() => {
        return () => clearTimeout(timer.current);
    }, []);

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

    return (

        <div role="listitem" className="menu-item w-dyn-item w-col w-col-6">
            <div className="food-card">
                <Link href={currentSlug}>
                    <a className="food-image-square w-inline-block">
                        <img src={img || '/images/no-image.svg'} alt={name || 'Image produit'} style={{ 'width': '100%' }} className="food-image" loading="lazy" />
                    </a>
                </Link>
                <div className="food-card-content">
                    <Link href={currentSlug}>
                        <a className="food-title-wrap w-inline-block">
                            <h6 className="heading-9" >{name}</h6>
                            <div className="div-block-prix">
                                <div className="price">{ product.price.ati.special ? formatPrice(product.price.ati.special) : formatPrice(product.price.ati.normal) }</div>
                                { product.price.ati.special ? <div className="price sale">{formatPrice(product.price.ati.normal)}</div> : null }
                            </div>
                        </a>
                    </Link>
                    <p className="paragraph">{description}</p>
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