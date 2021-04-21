import Link           from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import CartItem       from '@components/cart/CartItem';
import { useCart }    from '@lib/hooks';

export default function CartListItems() {
    const { cart, setCart } = useCart();
    const { t }             = useTranslation();

    if (cart.items?.length > 0) {
        return (

            <form className="w-commerce-commercecartform">

                {/* TMP : partie rajouté "à la main" à partir du html en ligne */}
                <div className="w-commerce-commercecartlist" >
                    {cart.items?.map((item) => (
                        <CartItem item={item} setCart={setCart} key={item._id} />
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
                        {/* TODO : si form, alors il faut un bouton de validation */}
                        <Link href="/checkout/clickandcollect">
                            <a className="checkout-button-2 w-button">{t('components/cart:cartListItem.ordering')}</a>
                        </Link>
                        {/* <a href="checkout.html" value="Continue to Checkout" className="w-commerce-commercecartcheckoutbutton checkout-button">Continue to Checkout</a> */}
                    </div>
                </div>
            </form>

        );
    }

    return (
        <div className="w-commerce-commercecartemptystate empty-state">
            <div>{t('components/cart:cartListItem.empty')}</div>
            <div className="button-arrow-wrap">
                <a href="/" className="button w-button">{t('components/cart:goToHome')}</a>
            </div>
        </div>
    );
}