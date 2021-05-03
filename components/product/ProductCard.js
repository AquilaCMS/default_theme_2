import { useEffect, useState } from 'react';
import Link                    from 'next/link';
import { useRouter }           from 'next/router';
import useTranslation          from 'next-translate/useTranslation';
import Button                  from '@components/ui/Button';
import { generateSlug }        from '@lib/aquila-connector/product/helpersProduct';
import { addToCart }           from '@lib/aquila-connector/cart';
import { useShowCartSidebar }  from '@lib/hooks';

export default function ProductCard({ product, cartId, setCartId }) {
    const [qty, setQty]             = useState(1);
    const [message, setMessage]     = useState();
    const [timer, setTimer]         = useState();
    const [isLoading, setIsLoading] = useState(false);
    const { query }                 = useRouter();
    const { setShowCartSidebar }    = useShowCartSidebar();
    const { t }                     = useTranslation();
    
    const { slug, name, description, img, canonical } = product;

    const currentSlug = generateSlug({
        categorySlugs: query.categorySlugs,
        slug,
        canonical
    });

    useEffect(() => {
        return () => clearTimeout(timer);
    }, []);

    const onChangeQty = (e) => {
        setQty(Number(e.target.value));
    };

    const onAddToCart = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const newCart   = await addToCart(cartId, product, qty);
            document.cookie = 'cart_id=' + newCart._id + '; path=/;';
            document.cookie = 'count_cart=' + newCart.items.length + '; path=/;';
            setShowCartSidebar(true);
            setCartId(newCart._id);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            const t = setTimeout(() => { setMessage(); }, 3000);
            setTimer(t);
        } finally {
            setIsLoading(false);
        }
    };

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
                                <div className="price">{ product.price.ati.special ? product.price.ati.special.toFixed(2) : product.price.ati.normal.toFixed(2) } €</div>
                                { product.price.ati.special ? <div className="price sale">{product.price.ati.normal.toFixed(2)} €</div> : null }
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
                                <form className="w-commerce-commerceaddtocartform default-state" onSubmit={onAddToCart}>
                                    <input type="number" disabled={product.type !== 'simple'} className="w-commerce-commerceaddtocartquantityinput quantity" value={qty} onChange={onChangeQty} />
                                    <Button 
                                        text={product.type === 'simple' ? t('components/product:productCard.addToBasket') : t('components/product:productCard.compose')}
                                        loadingText={t('components/product:productCard.addToCartLoading')}
                                        isLoading={isLoading}
                                        disabled={product.type !== 'simple'} 
                                        className="w-commerce-commerceaddtocartbutton order-button"
                                    />
                                </form>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>


    );
}