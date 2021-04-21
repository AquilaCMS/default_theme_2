import Head                                  from 'next/head';
import useTranslation                        from 'next-translate/useTranslation';
import AccountLayout                         from '@components/account/AccountLayout';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ req }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/account/login?redirect=' + encodeURI('/account/bills'));
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
                <title>{t('pages/account/bills:title')}</title>
            </Head>

            <div className="container-tunnel-03">
                <h2 className="heading-2-steps">{t('pages/account/bills:titleNav')}</h2>
            </div>
            <div className="container-order-list">
                <div className="div-block-order-liste">
                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                        <h5 className="heading-6">Commande : # 123456789</h5>
                        <p className="paragraph">15,00€</p>
                        <a href="#" className="button-view-order w-button">Télécharger</a>
                    </div>
                </div>
            </div>

        </AccountLayout>
    );
}
