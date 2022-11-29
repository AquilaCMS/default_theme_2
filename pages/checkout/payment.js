import { useEffect }                                                                          from 'react';
import { useRouter }                                                                          from 'next/router';
import useTranslation                                                                         from 'next-translate/useTranslation';
import parse                                                                                  from 'html-react-parser';
import LightLayout                                                                            from '@components/layouts/LightLayout';
import NextSeoCustom                                                                          from '@components/tools/NextSeoCustom';
import Button                                                                                 from '@components/ui/Button';
import { getShipmentCart, cartToOrder }                                                       from '@aquilacms/aquila-connector/api/cart';
import { makePayment }                                                                        from '@aquilacms/aquila-connector/api/payment';
import { useState }                                                                           from 'react';
import { useCart, usePaymentMethods, useSiteConfig }                                          from '@lib/hooks';
import { initAxios, authProtectedPage, formatPrice, serverRedirect, moduleHook, unsetCookie } from '@lib/utils';
import { dispatcher }                                                                         from '@lib/redux/dispatcher';
import i18n                                                                                   from '/i18n.json';

export async function getServerSideProps({ locale, req, res }) {
    initAxios(locale, req, res);

    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI(moduleHook('cart-validate-btn') ? '/checkout/clickandcollect' : '/checkout/address'));
    }
    return dispatcher(locale, req, res);
}

export default function CheckoutPayment() {
    const [show, setShow]               = useState(false);
    const [paymentForm, setPaymentForm] = useState('');
    const [isLoading, setIsLoading]     = useState(false);
    const [message, setMessage]         = useState();
    const router                        = useRouter();
    const { cart }                      = useCart();
    const paymentMethods                = usePaymentMethods();
    const { langs }                     = useSiteConfig();
    const { lang, t }                   = useTranslation();

    const defaultLanguage = i18n.defaultLocale;
    
    useEffect(() => {
        const fetchData = async () => {
            let redirect = true;
            try {
                const res = await getShipmentCart({ _id: cart._id }, null, {}, lang);
                if (res.datas?.length) {
                    if (res.datas.find((item) => item.code === cart.delivery.code && item.price === cart.delivery.price.ati)) {
                        redirect = false;
                        setShow(true);
                    }
                }
            } catch (err) {
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            }
            if (redirect) {
                router.push('/checkout/delivery');
            }
        };

        // Check if the cart is empty
        if (!cart?.items?.length) {
            router.push('/');
        } else if (moduleHook('cart-validate-btn')) {
            if (!cart.orderReceipt?.date) {
                router.push('/checkout/clickandcollect');
            }
        } else if (!cart.delivery?.method) { 
            router.push('/checkout/delivery');
        } else if (!cart.addresses || !cart.addresses.billing) {
            router.push('/checkout/address');
        } else if (cart.orderReceipt?.method !== 'withdrawal' && cart.delivery?.code) {
            fetchData();
        }
    }, []);

    useEffect(() => {
        if (paymentForm) {
            document.getElementById('paymentid').submit();
        }
    }, [paymentForm]);

    const onSubmitPayment = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const postForm = e.currentTarget;

        const payment_code = postForm.payment.value;
        if (!payment_code) {
            return setIsLoading(false);
        }

        try {
            // Cart to order
            const order = await cartToOrder(cart._id, lang);

            // Payment
            const returnURL = `/${defaultLanguage === lang ? '' : `${lang}/`}checkout/confirmation`;
            const form      = await makePayment(order.number, payment_code, returnURL, lang);
            if (form) {
                if (form?.status && form.status !== 200) {
                    return setMessage({ type: 'error', message: form.message || t('common:message.unknownError') });
                } else {
                    setPaymentForm(form);
                }
            }

            document.cookie = 'order_id=' + order._id + '; path=/;';
            unsetCookie('cart_id');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    const previousStep = () => {
        router.back();
    };

    if (!show) {
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
                        <h2 className="heading-2-steps">{t('pages/checkout:payment.step4')}</h2>
                    </div>
                    <div className="col-log w-row">
                        <form className="form-mode-paiement-tunnel" onSubmit={onSubmitPayment}>
                            <div className="columns-picker-paiement-tunnel w-row">
                                {
                                    paymentMethods && paymentMethods.map((payment, index) => (
                                        <div key={payment._id} className="column-center w-col w-col-6">
                                            <label className="checkbox-click-collect w-radio">
                                                <input type="radio" name="payment" value={payment.code} defaultChecked={index === 0} required style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                                {
                                                    payment.urlLogo ? (
                                                        <img src={payment.urlLogo} alt={payment.code} style={{ width: '100px' }} />
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
                            <button type="button" className="log-button-03 w-button" onClick={previousStep}>{t('pages/checkout:payment.previous')}</button>
                            &nbsp;
                            <Button 
                                text={t('pages/checkout:payment.pay')}
                                loadingText={t('pages/checkout:payment.submitLoading')}
                                isLoading={isLoading}
                                className="log-button-03 w-button"
                            />
                        </form>
                        <div className="content" style={{ display: 'none' }}>
                            {parse(paymentForm)}
                        </div>
                    </div>
                    {
                        message && (
                            <div className={`w-commerce-commerce${message.type}`}>
                                <div>
                                    {message.message}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </LightLayout>
    );
}