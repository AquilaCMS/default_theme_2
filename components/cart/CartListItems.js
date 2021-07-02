import Link           from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import CartItem       from '@components/cart/CartItem';
import { useCart }    from '@lib/hooks';

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
                    <div className="w-commerce-commercecartlineitem cart-line-item">
                        <div>{t('components/cart:cartListItem.total')}</div>
                        <div className="w-commerce-commercecartordervalue text-block">
                            {cart.priceTotal.ati.toFixed(2)} €
                        </div>
                    </div>
                    <div>
                        <Link href="/checkout/clickandcollect">
                            <a className="checkout-button-2 w-button">{t('components/cart:cartListItem.ordering')}</a>
                        </Link>
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