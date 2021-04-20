import Head                                  from 'next/head';
import AccountLayout                         from '@components/account/AccountLayout';
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
    return (
        <AccountLayout>
            <Head>
                <title>Mes informations</title>
            </Head>

            <div className="container-tunnel-02">
                <h2 className="heading-2-steps">Mes commandes</h2>
            </div>
            <div className="container-order-list">
                <div className="div-block-order-liste">
                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                        <h5 className="heading-6">Commande : # 123456789</h5>
                        <p className="paragraph">15,00€</p>
                        <a href="#" className="lien_voir w-inline-block">
                            <h6 className="heading-bouton-voir">Voir</h6><img src="/images/Plus.svg" style={{ opacity: '0.5' }} alt="" className="plus-2" />
                        </a>
                    </div>
                    <div className="section-detail-order">
                        <div className="container-tunnel-02">
                            <h2 className="heading-5 center">Récapitulatif de ma commande: # 123456789</h2>
                        </div>
                        <div className="container-order">
                            <div className="columns-tunnel w-row">
                                <div className="w-col w-col-8">
                                    <div className="div-block-tunnel w-form">
                                        <form>
                                            <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                                <h5>Vos informations</h5><label htmlFor="email-4" className="required">* Obligatoire</label>
                                            </div>
                                            <div className="block-content-tunnel">
                                                <div className="w-row">
                                                    <div className="w-col w-col-6"><label htmlFor="email-4">Email</label>
                                                        <p className="label-tunnel">mail@mail.com</p>
                                                    </div>
                                                    <div className="w-col w-col-6"><label htmlFor="email-4">Adresse de livraison</label>
                                                        <p className="label-tunnel">Mon adresse<br />Mon appartement<br />Mon code postal<br />Ma ville
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                                <h5>Mode de livraison</h5>
                                            </div>
                                            <div className="block-content-tunnel-space-flex"><label htmlFor="email-4">Livraison</label></div>
                                            <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                                <h5>Informations de paiement</h5>
                                            </div>
                                            <div className="block-content-tunnel">
                                                <div className="w-row">
                                                    <div className="w-col w-col-6"><label htmlFor="email-4">Mode de paiement</label>
                                                        <p className="label-tunnel">VISA 4242<br />01/2025</p>
                                                    </div>
                                                    <div className="w-col w-col-6"><label htmlFor="email-4">Adresse de facturation</label>
                                                        <p className="label-tunnel">Mon adresse<br />Mon appartement<br />Mon code postal<br />Ma ville
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                        <div className="w-form-done">
                                            <div>Thank you! Your submission has been received!</div>
                                        </div>
                                        <div className="w-form-fail">
                                            <div>Oops! Something went wrong while submitting the form.</div>
                                        </div>
                                    </div>
                                    <div className="div-block-tunnel">
                                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                            <h5>Détail de la commande : # 123456789</h5>
                                        </div>
                                        <div className="block-content-tunnel">
                                            <div className="collection-list-wrapper-2 w-dyn-list">
                                                <div role="list" className="w-dyn-items">
                                                    <div role="listitem" className="w-dyn-item">
                                                        <div className="item-tunnel w-row">
                                                            <div className="w-col w-col-3">
                                                                <a href="#" className="food-image-square-tunnel w-inline-block"><img src="" alt="" className="food-image" /></a>
                                                            </div>
                                                            <div className="w-col w-col-9">
                                                                <a href="#" className="food-title-wrap w-inline-block">
                                                                    <h6 className="heading-9" />
                                                                    <div className="div-block-prix">
                                                                        <div className="price-2" />
                                                                        <div className="price-2 sale" />
                                                                    </div>
                                                                </a>
                                                                <p className="paragraph">Quantité : 1</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-dyn-empty">
                                                    <div>No items found.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="column-tunnel-prix w-col w-col-4">
                                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                        <h5>Détail de la commande</h5>
                                    </div>
                                    <div className="block-content-tunnel">
                                        <div>
                                            <div className="w-row">
                                                <div className="w-col w-col-6 w-col-small-6 w-col-tiny-6">
                                                    <p className="label-tunnel">Sous Total</p>
                                                </div>
                                                <div className="w-col w-col-6 w-col-small-6 w-col-tiny-6">
                                                    <p className="prix-tunnel">15,00 €</p>
                                                </div>
                                            </div>
                                            <div className="w-row">
                                                <div className="w-col w-col-6 w-col-small-6 w-col-tiny-6">
                                                    <p className="label-tunnel">Livraison</p>
                                                </div>
                                                <div className="w-col w-col-6 w-col-small-6 w-col-tiny-6">
                                                    <p className="prix-tunnel">0,00 €</p>
                                                </div>
                                            </div>
                                            <div className="w-row">
                                                <div className="w-col w-col-6 w-col-small-6 w-col-tiny-6">
                                                    <p className="label-tunnel">Total</p>
                                                </div>
                                                <div className="w-col w-col-6 w-col-small-6 w-col-tiny-6">
                                                    <p className="prix-tunnel">15,00 €</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AccountLayout>
    );
}
