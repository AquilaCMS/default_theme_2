import { useEffect }                                      from 'react';
import { useRouter }                                      from 'next/router';
import useTranslation                                     from 'next-translate/useTranslation';
import LightLayout                                        from '@components/layouts/LightLayout';
import NextSeoCustom                                      from '@components/tools/NextSeoCustom';
import Button                                             from '@components/ui/Button';
import { cartToOrder }                                    from 'aquila-connector/api/cart';
import { deferredPayment }                                from 'aquila-connector/api/payment';
import { useState }                                       from 'react';
import { useCart, usePaymentMethods }                     from '@lib/hooks';
import { authProtectedPage, serverRedirect, unsetCookie } from '@lib/utils';
import { dispatcher }                                     from '@lib/redux/dispatcher';

export async function getServerSideProps({ locale, req, res }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI('/checkout/clickandcollect'));
    }
    return dispatcher(locale, req, res);
}

export default function CheckoutPayment() {
    const [isLoading, setIsLoading] = useState(false);
    const router                    = useRouter();
    const { cart }                  = useCart();
    const paymentMethods            = usePaymentMethods();
    const { lang, t }               = useTranslation();

    useEffect(() => {
        // Check if the cart is empty
        if (!cart?.items?.length) {
            return router.push('/');
        }

        // Check if click & collect is validated
        if (!cart.orderReceipt?.date) {
            return router.push('/checkout/clickandcollect');
        }

        // Check if the billing address exists
        if (!cart.addresses || !cart.addresses.billing) {
            return router.push('/checkout/address');
        }
    }, []);

    const onSubmitPayment = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const payment_code = e.currentTarget.payment.value;
            if (!payment_code) return setIsLoading(false);

            // Cart to order
            const order = await cartToOrder(cart._id, lang);

            // Payment
            const payment = paymentMethods.find((p) => p.code === payment_code);
            if (payment.isDeferred === true) {
                // Deferred payment (check, cash...)
                await deferredPayment(order.number, payment_code, lang);
            } else {
                // Immediat payment (CB...)
                
            }
            document.cookie = 'order_id=' + order._id + '; path=/;';
            unsetCookie('cart_id');
            router.push('/checkout/confirmation');
        } catch (err) {
            console.error(err.message || t('common:message.unknownError'));
        } finally {
            setIsLoading(false);
        }
    };

    const previousStep = () => {
        router.back();
    };

    if (!cart?.items?.length || !cart.orderReceipt?.date || !cart.addresses || !cart.addresses.billing) {
        return null;
    }

    return (
        <LightLayout>
            <NextSeoCustom
                noindex={true}
                title={t('pages/checkout:payment.title')}
                description={t('pages/checkout:payment.description')}
            />

            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">{t('pages/checkout:payment.titleH1')}</h1>
                    </div>
                </div>
            </div>

            <div className="section-tunnel">
                <div className="container-tunnel">
                    <div className="container-step w-container">
                        <h2 className="heading-steps">4</h2>
                        <h2 className="heading-2-steps">{t('pages/checkout:payment.paymentMethod')}</h2>
                    </div>
                    <div className="col-log w-row">
                        <form className="form-mode-paiement-tunnel" onSubmit={onSubmitPayment}>
                            <div className="columns-picker-paiement-tunnel w-row">
                                {
                                    paymentMethods && paymentMethods.map((payment) => (
                                        <div key={payment._id} className="column-center w-col w-col-6">
                                            <label className="checkbox-click-collect w-radio">
                                                <input type="radio" name="payment" value={payment.code} required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                                {
                                                    payment.urlLogo ? (
                                                        <img src={`${payment.urlLogo.indexOf('/') === 0 ? process.env.NEXT_PUBLIC_IMG_URL : ''}${payment.urlLogo}`} alt={payment.code} style={{ width: '100px' }} />
                                                    ) : (
                                                        <span className="checkbox-label w-form-label">{payment.name}</span>
                                                    )
                                                }
                                            </label>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="w-commerce-commercecartfooter" style={{ width: '100%' }}>
                                {
                                    cart.delivery?.value && (
                                        <div className="w-commerce-commercecartlineitem cart-line-item">
                                            <div>{t('components/cart:cartListItem.delivery')}</div>
                                            <div>{cart.delivery.value.ati.toFixed(2)} €</div>
                                        </div>
                                    )
                                }
                                <div className="w-commerce-commercecartlineitem cart-line-item">
                                    <div>{t('components/cart:cartListItem.total')}</div>
                                    <div className="w-commerce-commercecartordervalue text-block">
                                        {cart.priceTotal.ati.toFixed(2)} €
                                    </div>
                                </div>
                            </div>
                            <button type="button" className="log-button-03 w-button" onClick={previousStep}>{t('pages/checkout:payment.previous')}</button>
                            &nbsp;
                            <Button 
                                text={t('pages/checkout:payment.pay')}
                                loadingText={t('pages/checkout:payment.submitLoading')}
                                isLoading={isLoading}
                                className="log-button-03 w-button"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </LightLayout>
    );
}