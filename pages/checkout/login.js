import { useEffect }                         from 'react';
import Head                                  from 'next/head';
import useTranslation                        from 'next-translate/useTranslation';
import Layout                                from '@components/layouts/Layout';
import LoginBlock                            from '@components/login/LoginBlock';
import RegisterBlock                         from '@components/login/RegisterBlock';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ req, res }) {
    // If the user is already logged in, we will automatically redirect to the page /account/informations
    const user = await authProtectedPage(req.headers.cookie);
    if (user) {
        return serverRedirect('/checkout/clickandcollect');
    }
    return dispatcher(req, res);
}

export default function CheckoutLogin() {
    const { t } = useTranslation();

    useEffect(() => {
        document.body.style.overflow = null;
    }, []);

    return (
        <Layout>
            <Head>
                <title>{t('pages/checkout:login.title')}</title>
                <meta name="description" content={t('pages/checkout:login.description')} />
            </Head>

            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">{t('pages/checkout:login.titleH1')}</h1>
                    </div>
                </div>
            </div>

            <div className="section-tunnel">
                <div className="container-tunnel">
                    <div className="container-step w-container">
                        <h2 className="heading-steps">1</h2>
                        <h2 className="heading-2-steps">{t('pages/checkout:login.step1')}</h2>
                    </div>
                    <div className="col-log w-row">
                        <LoginBlock />

                        <div className="w-col w-col-2" />

                        <RegisterBlock />
                    </div>
                </div>
            </div>

        </Layout>
    );
}
