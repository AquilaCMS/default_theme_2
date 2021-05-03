import { useState }                          from 'react';
import Head                                  from 'next/head';
import useTranslation                        from 'next-translate/useTranslation';
import AccountLayout                         from '@components/account/AccountLayout';
import OrderDetails                          from '@components/order/OrderDetails';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { useOrders }                         from '@lib/hooks';
import { dispatcher }                        from '@lib/redux/dispatcher';
import React                                 from 'react';

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
    const [viewOrders, setViewOrders] = useState([]);
    const orders                      = useOrders();
    const { t }                       = useTranslation();

    const onChangeViewOrders = (index) => {
        console.log(index);
        viewOrders[index] = !viewOrders[index];
        console.log(viewOrders);
        setViewOrders([...viewOrders]);
    };
    
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
                    {
                        orders.length ? orders.map((order, index) => {
                            return (
                                <React.Fragment key={order._id}>
                                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                        <h5 className="heading-6">TODOTRAD Commande : #{order.number}</h5>
                                        <p className="paragraph">{order.priceTotal.ati.toFixed(2)} €</p>
                                        <div className="lien_voir w-inline-block" style={{ cursor: 'pointer' }} onClick={() => onChangeViewOrders(index)}>
                                            <h6 className="heading-bouton-voir">Voir</h6>
                                            <img src="/images/Plus.svg" alt="" className={`plus-2${viewOrders[index] ? ' plus-2-active' : ''}`} />
                                        </div>
                                    </div>
                                    <div className="section-detail-order" hidden={!viewOrders[index]}>
                                        <div className="container-tunnel-02">
                                            <h2 className="heading-5 center">TODOTRAD Récapitulatif de ma commande: #{order.number}</h2>
                                        </div>
                                        <OrderDetails order={order} />
                                    </div>
                                </React.Fragment>
                            );
                        }) : <p>Aucune commande</p>
                    }
                </div>
            </div>

        </AccountLayout>
    );
}
