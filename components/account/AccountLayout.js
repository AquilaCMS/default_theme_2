import Link            from 'next/link';
import { useRouter }   from 'next/router';
import useTranslation  from 'next-translate/useTranslation';
import Layout          from '@components/layouts/Layout';
import { unsetCookie } from '@lib/utils';

export default function AccountLayout({ children }) {
    const router = useRouter();
    const { t }  = useTranslation();

    const onLogout = () => {
        unsetCookie('jwt');
        router.push('/');
    };

    let TMPHighlight = 2;
    switch(children[1].props.className) {
    case 'container-tunnel-01' :
        TMPHighlight = 1;
        break;
    case 'container-tunnel-03' :
        TMPHighlight = 3;
        break;
    }

    return (
        <Layout>

            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">{t('components/account/accountLayout:titleH1')}</h1>
                    </div>
                </div>
            </div>

            <div className="section-account">
                <div className="tab-pane-wrap-account w-tabs">
                    <div className="tab-menu-round-account w-tab-menu">
                        <Link href="/account/informations">
                            <a className={(TMPHighlight === 1 ? 'w--current' : '') + ' tab-link-round w-inline-block w-tab-link'}>
                                <div>{t('components/account/accountLayout:navigation.myInformations')}</div>
                            </a>
                        </Link>
                        <Link href="/account">
                            <a className={(TMPHighlight === 2 ? 'w--current' : '') + ' tab-link-round w-inline-block w-tab-link'}>
                                <div>{t('components/account/accountLayout:navigation.myOrders')}</div>
                            </a>
                        </Link>
                        <Link href="/account/bills">
                            <a className={(TMPHighlight === 3 ? 'w--current' : '') + ' tab-link-round w-inline-block w-tab-link'}>
                                <div>{t('components/account/accountLayout:navigation.myBills')}</div>
                            </a>
                        </Link>
                        <button type="button" className="tab-link-round w-inline-block w-tab-link" onClick={onLogout}>{t('components/account/accountLayout:navigation.logout')}</button>
                    </div>
                    <div className="w-tab-content">

                        <main>{children}</main>

                    </div>
                </div>
            </div>

        </Layout>
    );
}
