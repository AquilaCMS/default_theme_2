import Link                        from 'next/link';
import useTranslation              from 'next-translate/useTranslation';
import CartItem                    from '@components/cart/CartItem';
import { useCart }                 from '@lib/hooks';
import { formatPrice, moduleHook } from '@lib/utils';

export default function CartListItems() {
    const { cart } = useCart();
    const { t }    = useTranslation();

    if (cart.items?.length > 0) {
        return (
            <form className="w-commerce-commercecartform">
                <div className="w-commerce-commercecartlist" >
                    {cart.items.map((item) => (
                        <CartItem item={item} key={item._id} />
                    ))}
                </div>
                <div className="w-commerce-commercecartfooter">
                    {
                        cart.delivery?.method && cart.delivery?.value && (
                            <div className="w-commerce-commercecartlineitem cart-line-item">
                                <div>{t('components/cart:cartListItem.delivery')}</div>
                                <div>{formatPrice(cart.delivery.value.ati)}</div>
                            </div>
                        )
                    }
                    <div className="w-commerce-commercecartlineitem cart-line-item">
                        <div>{t('components/cart:cartListItem.total')}</div>
                        <div className="w-commerce-commercecartordervalue text-block">
                            {formatPrice(cart.priceTotal.ati)}
                        </div>
                    </div>
                    <div>
                        {
                            moduleHook('cart-validate-btn') || 
                                <Link href="/checkout/address">
                                    <a className="checkout-button-2 w-button">{t('components/cart:cartListItem.ordering')}</a>
                                </Link>
                        }
                    </div>
                </div>
            </form>
        );
    }

    return (
        <div className="w-commerce-commercecartemptystate empty-state">
            <div>{t('components/cart:cartListItem.empty')}</div>
            <div className="button-arrow-wrap">
                <Link href="/">
                    <a className="button w-button">{t('components/cart:cartListItem.goToHome')}</a>
                </Link>
            </div>
        </div>
    );
}