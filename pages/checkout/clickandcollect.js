import { useEffect, useState }               from 'react';
import Head                                  from 'next/head';
import { useRouter }                         from 'next/router';
import useTranslation                        from 'next-translate/useTranslation';
import ClickAndCollect                       from '@components/modules/ClickAndCollect';
import LightLayout                           from '@components/layouts/LightLayout';
import { useCart }                           from '@lib/hooks';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ req, res }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI('/checkout/clickandcollect'));
    }
    const pageProps      = await dispatcher(req, res);
    pageProps.props.user = user;
    return pageProps;
}

export default function CheckoutClickAndCollect() {
    const [message, setMessage] = useState();
    const router                = useRouter();
    const { cart }              = useCart();
    const { t }                 = useTranslation();
    
    useEffect(() => {
        if (!cart?.items?.length) {
            router.push('/');
        }
    }, []);
    
    const nextStep = () => {
        if (!cart.addresses || !cart.addresses.billing) {
            return setMessage({ type: 'error', message: t('pages/checkout:clickandcollect.submitError') });
        }
        if (cart.orderReceipt?.date) {
            const now         = Date.now() / 1000;
            const receiptDate = new Date(cart.orderReceipt.date).getTime() / 1000;
            if (receiptDate - now <= 0) {
                return setMessage({ type: 'error', message: t('pages/checkout:clickandcollect.submitError2') });
            }
        }
        router.push('/checkout/payment');
    };
    
    return (
        <LightLayout>
            <Head>
                <title>{t('pages/checkout:clickandcollect.title')}</title>
                <meta name="description" content={t('pages/checkout:clickandcollect.description')} />
            </Head>
            {
                cart?.items?.length > 0 && (
                    <>
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

                                <div className="form-mode-paiement-tunnel">
                                    <button type="button" className="log-button-03 w-button" onClick={nextStep}>{t('pages/checkout:clickandcollect.next')}</button>
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
                    </>
                )
            }
        </LightLayout>
    );
}
