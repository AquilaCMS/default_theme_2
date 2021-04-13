import Link     from 'next/link';
import CartItem from '@components/cart/CartItem';


export default function CartListItems() {

    const tmpTotal       = 10;
    const tmpProductList = [{}];

    if (tmpProductList.length > 0) {
        return (

            <form className="w-commerce-commercecartform">

                {/* TMP : partie rajouté "à la main" à partir du html en ligne */}
                <div className="w-commerce-commercecartlist" >
                    {tmpProductList.map((item, index) => (
                        <CartItem key={index} />
                    ))}
                </div>

                <div className="w-commerce-commercecartfooter">
                    <div className="w-commerce-commercecartlineitem cart-line-item">
                        <div>Total</div>
                        <div className="w-commerce-commercecartordervalue text-block">
                            {tmpTotal.toFixed(2)} €
                        </div>
                    </div>
                    <div>
                        {/* TODO : si form, alors il faut un bouton de validation */}
                        <Link href="/checkout/clickandcollect">
                            <a className="checkout-button-2 w-button">COMMANDER !</a>
                        </Link>
                        {/* <a href="checkout.html" value="Continue to Checkout" className="w-commerce-commercecartcheckoutbutton checkout-button">Continue to Checkout</a> */}
                    </div>
                </div>
            </form>

        );
    }

    return (
        <div className="w-commerce-commercecartemptystate empty-state">
            <div>Votre Panier est vide</div>
            <div className="button-arrow-wrap">
                <a href="/" className="button w-button">Découvrir notre Carte</a>
            </div>
        </div>
    );
}