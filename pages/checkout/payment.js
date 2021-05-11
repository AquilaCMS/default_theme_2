import { useEffect }                         from 'react';
import Head                                  from 'next/head';
import { useRouter }                         from 'next/router';
import useTranslation                        from 'next-translate/useTranslation';
import LightLayout                           from '@components/layouts/LightLayout';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';
import { cartToOrder }                       from '@lib/aquila-connector/cart';
import { deferredPayment }                   from '@lib/aquila-connector/payment';
import { useCart, usePayments }              from '@lib/hooks';
import { unsetCookie }                       from '@lib/utils';

export async function getServerSideProps({ req, res }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI('/checkout/clickandcollect'));
    }
    return dispatcher(req, res);
}

export default function CheckoutPayment() {
    const router   = useRouter();
    const { cart } = useCart();
    const payments = usePayments();
    const { t }    = useTranslation();

    useEffect(() => {
        if (!cart?.items?.length) {
            router.push('/');
        }
    });

    const onSubmitPayment = async (e) => {
        e.preventDefault();

        try {
            const payment_code = e.currentTarget.payment.value;
            if (!payment_code) return;

            // Cart to order
            const order = await cartToOrder(cart._id);

            // Payment
            const payment = payments.find((p) => p.code === payment_code);
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

    return (
        <LightLayout>
            <Head>
                <title>{t('pages/checkout:payment.title')}</title>
                <meta name="description" content={t('pages/checkout:payment.description')} />
            </Head>

            {
                cart?.items?.length > 0 && (
                    <>
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
                                    <h2 className="heading-2-steps">TODOTRAD Moyen de paiement</h2>
                                </div>
                                <div className="col-log w-row">
                                    <form className="form-mode-paiement-tunnel" onSubmit={onSubmitPayment}>
                                        <div className="columns-picker-paiement-tunnel w-row">
                                            {
                                                payments && payments.map((payment) => {
                                                    return (
                                                        <div key={payment._id} className="column-center w-col w-col-6">
                                                            <label className="checkbox-click-collect w-radio">
                                                                <input type="radio" name="payment" value={payment.code} required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                                                <span className="checkbox-label w-form-label">{payment.name}</span>
                                                            </label>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                        <button type="button" className="log-button-03 w-button" onClick={previousStep}>TODOTRAD RETOUR</button>
                            &nbsp;
                                        <button type="submit" className="log-button-03 w-button">TODOTRAD PAYER</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </LightLayout>
    );
}