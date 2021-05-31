import { useEffect }                                      from 'react';
import { useRouter }                                      from 'next/router';
import useTranslation                                     from 'next-translate/useTranslation';
import LightLayout                                        from '@components/layouts/LightLayout';
import NextSeoCustom                                      from '@components/tools/NextSeoCustom';
import { cartToOrder }                                    from '@lib/aquila-connector/cart';
import { deferredPayment }                                from '@lib/aquila-connector/payment';
import { useCart, usePaymentMethods }                     from '@lib/hooks';
import { authProtectedPage, serverRedirect, unsetCookie } from '@lib/utils';
import { dispatcher }                                     from '@lib/redux/dispatcher';

export async function getServerSideProps({ req, res }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI('/checkout/clickandcollect'));
    }
    return dispatcher(req, res);
}

export default function CheckoutPayment() {
    const router         = useRouter();
    const { cart }       = useCart();
    const paymentMethods = usePaymentMethods();
    const { t }          = useTranslation();

    useEffect(() => {
        // Check if the cart is empty
        if (!cart?.items?.length) {
            return router.push('/');
        }

        // Check if the billing address exists
        if (!cart.addresses || !cart.addresses.billing) {
            return router.push('/checkout/clickandcollect');
        }
    }, []);

    const onSubmitPayment = async (e) => {
        e.preventDefault();

        try {
            const payment_code = e.currentTarget.payment.value;
            if (!payment_code) return;

            // Cart to order
            const order = await cartToOrder(cart._id);

            // Payment
            const payment = paymentMethods.find((p) => p.code === payment_code);
            if (payment.isDeferred === true) {
                // Deferred payment (check, cash...)
                await deferredPayment(order.number, payment_code);
            } else {
                // Immediat payment (CB...)
                
            }
            document.cookie = 'order_id=' + order._id + '; path=/;';
            unsetCookie('cart_id');
            router.push('/checkout/confirmation');
        } catch (err) {
            console.error(err.message || t('common:message.unknownError'));
        }
    };

    const previousStep = () => {
        router.back();
    };

    if (!cart?.items?.length) {
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
                        <h2 className="heading-steps">3</h2>
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
                                                        <img src={`${process.env.NEXT_PUBLIC_IMG_URL}${payment.urlLogo}`} alt={payment.code} style={{ width: '100px' }} />
                                                    ) : (
                                                        <span className="checkbox-label w-form-label">{payment.name}</span>
                                                    )
                                                }
                                            </label>
                                        </div>
                                    ))
                                }
                            </div>
                            <button type="button" className="log-button-03 w-button" onClick={previousStep}>{t('pages/checkout:payment.previous')}</button>
                                        &nbsp;
                            <button type="submit" className="log-button-03 w-button">{t('pages/checkout:payment.pay')}</button>
                        </form>
                    </div>
                </div>
            </div>
        </LightLayout>
    );
}