import Link                                      from 'next/link';
import useTranslation                            from 'next-translate/useTranslation';
import CartItem                                  from '@components/cart/CartItem';
import Layout                                    from '@components/layouts/Layout';
import NextSeoCustom                             from '@components/tools/NextSeoCustom';
import { useCart }                               from '@lib/hooks';
import { setLangAxios, formatPrice, moduleHook } from '@lib/utils';
import { dispatcher }                            from '@lib/redux/dispatcher';

export async function getServerSideProps({ locale, req, res }) {
    setLangAxios(locale, req, res);

    const pageProps = await dispatcher(locale, req, res);
    return pageProps;
}

export default function CheckoutCart() {
    const { cart } = useCart();
    const { t }    = useTranslation();

    return (
        <Layout>
            <NextSeoCustom
                noindex={true}
                title={t('pages/checkout:cart.title')}
                description={t('pages/checkout:cart.description')}
            />
            
            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">{t('pages/checkout:cart.titleH1')}</h1>
                    </div>
                </div>
            </div>

            <div className="section-tunnel">
                <div className="container-tunnel">
                    {
                        cart.items?.filter((item) => !item.typeDisplay)?.length > 0 ? (
                            <form className="w-commerce-commercecartform">
                                <div className="w-commerce-commercecartlist" >
                                    {cart.items?.filter((item) => !item.typeDisplay).map((item) => (
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
                                </div>
                                {
                                    moduleHook('cart-validate-btn') || 
                                        <Link href="/checkout/address">
                                            <a className="checkout-button-2 w-button">{t('pages/checkout:cart.ordering')}</a>
                                        </Link>
                                }
                            </form>
                        ) : (
                            <div className="w-commerce-commercecartemptystate empty-state">
                                <div>{t('components/cart:cartListItem.empty')}</div>
                                <div className="button-arrow-wrap">
                                    <Link href="/">
                                        <a className="button w-button">{t('components/cart:cartListItem.goToHome')}</a>
                                    </Link>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </Layout>
    );
}