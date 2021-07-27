import { useEffect, useState }               from 'react';
import { useRouter }                         from 'next/router';
import useTranslation                        from 'next-translate/useTranslation';
import LightLayout                           from '@components/layouts/LightLayout';
import NextSeoCustom                         from '@components/tools/NextSeoCustom';
import ClickAndCollect                       from 'modules/ClickAndCollect';
import { setUser }                           from 'aquila-connector/api/user';
import { useCart }                           from '@lib/hooks';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ locale, req, res }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI('/checkout/clickandcollect'));
    }
    const pageProps      = await dispatcher(locale, req, res);
    pageProps.props.user = user;
    return pageProps;
}

export default function CheckoutClickAndCollect({ user }) {
    const [message, setMessage] = useState();
    const router                = useRouter();
    const { cart }              = useCart();
    const { t }                 = useTranslation();
    
    useEffect(() => {
        // Check if the cart is empty
        if (!cart?.items?.length) {
            router.push('/');
        }
    }, []);
    
    const nextStep = async (e) => {
        e.preventDefault();

        // Check if click & collect is validated
        if (!cart.orderReceipt?.date) {
            return setMessage({ type: 'error', message: t('pages/checkout:clickandcollect.submitError') });
        }

        // Check if the date of receipt is consistent
        if (cart.orderReceipt.date) {
            const now         = Date.now() / 1000;
            const receiptDate = new Date(cart.orderReceipt.date).getTime() / 1000;
            if (receiptDate - now <= 0) {
                return setMessage({ type: 'error', message: t('pages/checkout:clickandcollect.submitError2') });
            }
        }

        // Update phone mobile user
        const updateUser = {
            _id         : user._id,
            phone_mobile: e.currentTarget.phone_mobile.value
        };
        try {
            await setUser(updateUser);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }

        router.push('/checkout/address');
    };

    if (!cart?.items?.length) {
        return null;
    }
    
    return (
        <LightLayout>
            <NextSeoCustom
                noindex={true}
                title={t('pages/checkout:clickandcollect.title')}
                description={t('pages/checkout:clickandcollect.description')}
            />
            
            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">{t('pages/checkout:clickandcollect.titleH1')}</h1>
                    </div>
                </div>
            </div>

            <div className="section-tunnel">
                <div className="container-tunnel">
                    <div className="container-step w-container">
                        <h2 className="heading-steps">2</h2>
                        <h2 className="heading-2-steps">{t('pages/checkout:clickandcollect.clickandcollect')}</h2>
                    </div>
                    
                    <ClickAndCollect />

                    <form onSubmit={nextStep}>
                        <div className="log-label"></div>
                        <div className="w-form">
                            <div><label>{t('pages/checkout:clickandcollect.labelPhone')}</label><input type="text" className="w-input" maxLength={256} name="phone_mobile" defaultValue={user.phone_mobile} required /></div>
                        </div>
                        <div className="w-commerce-commercecartfooter">
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
                        {
                            cart.orderReceipt?.date && (
                                <div className="form-mode-paiement-tunnel">
                                    <button type="submit" className="log-button-03 w-button">{t('pages/checkout:clickandcollect.next')}</button>
                                </div>
                            )
                        }
                        
                    </form>
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
