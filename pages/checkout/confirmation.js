import { useEffect }                         from 'react';
import Head                                  from 'next/head';
import { useRouter }                         from 'next/router';
import useTranslation                        from 'next-translate/useTranslation';
import Layout                                from '@components/layouts/Layout';
import OrderDetails                          from '@components/order/OrderDetails';
import { useOrder }                          from '@lib/hooks';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ req }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI('/checkout/clickandcollect'));
    }
    return dispatcher();
}

export default function CheckoutConfirmation() {
    const router = useRouter();
    const order  = useOrder();
    const { t }  = useTranslation();

    useEffect(() => {
        if (!order) {
            router.push('/');
        }
    });

    return (
        <Layout>
            <Head>
                <title>{t('pages/checkout:confirmation.title')}</title>
                <meta name="description" content={t('pages/checkout:confirmation.description')} />
            </Head>

            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">{t('pages/checkout:confirmation.titleH1')}</h1>
                    </div>
                </div>
            </div>

            {
                order && (
                    <div className="section-tunnel">
                        <div className="container-tunnel-02">
                            <h2 className="heading-2-steps">{t('pages/checkout:confirmation.summary')} : #{order.number}</h2>
                        </div>
                        <OrderDetails order={order} />
                    </div>
                )
                
            }
        </Layout>
    );
}