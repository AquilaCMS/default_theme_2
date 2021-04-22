import Head                                  from 'next/head';
import useTranslation                        from 'next-translate/useTranslation';
import AccountLayout                         from '@components/account/AccountLayout';
import OrderDetails                          from '@components/order/OrderDetails';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ req }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/account/login?redirect=' + encodeURI('/account'));
    }
    const pageProps      = await dispatcher();
    pageProps.props.user = user;
    return pageProps;
}

export default function Account() {
    const { t } = useTranslation();
    
    return (
        <AccountLayout>
            <Head>
                <title>{t('pages/account/index:title')}</title>
            </Head>

            <div className="container-tunnel-02">
                <h2 className="heading-2-steps">{t('pages/account/index:titleNav')}</h2>
            </div>
            <div className="container-order-list">
                <div className="div-block-order-liste">
                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                        <h5 className="heading-6">TODOTRAD Commande : # 123456789</h5>
                        <p className="paragraph">15,00€</p>
                        <a href="#" className="lien_voir w-inline-block">
                            <h6 className="heading-bouton-voir">Voir</h6><img src="/images/Plus.svg" style={{ opacity: '0.5' }} alt="" className="plus-2" />
                        </a>
                    </div>
                    <div className="section-detail-order">
                        <div className="container-tunnel-02">
                            <h2 className="heading-5 center">TODOTRAD Récapitulatif de ma commande: # 123456789</h2>
                        </div>
                        <OrderDetails />
                    </div>
                </div>
            </div>

        </AccountLayout>
    );
}
