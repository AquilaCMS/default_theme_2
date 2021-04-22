import Head                                  from 'next/head';
import useTranslation                        from 'next-translate/useTranslation';
import Layout                                from '@components/layouts/Layout';
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
    const { t } = useTranslation();
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

            <div id="03" className="section-tunnel">
                <div id="03" className="container-tunnel-02">
                    <h2 className="heading-2-steps">TODOTRAD Récapitulatif de ma commande: # 123456789</h2>
                </div>
                <div className="container-order">
                    <div className="columns-tunnel w-row">
                        <div className="w-col w-col-8">
                            <div className="div-block-tunnel w-form">
                                <form id="email-form-3" name="email-form-3" data-name="Email Form 3">
                                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                        <h5>Vos informations</h5><label htmlFor="email-4" className="required">* Obligatoire</label>
                                    </div>
                                    <div className="block-content-tunnel">
                                        <div className="w-row">
                                            <div className="w-col w-col-6"><label htmlFor="email-3">Email</label>
                                                <p className="label-tunnel">mail@mail.com</p>
                                            </div>
                                            <div className="w-col w-col-6"><label htmlFor="email-2">Adresse de livraison</label>
                                                <p className="label-tunnel">Mon adresse<br />Mon appartement<br />Mon code postal<br />Ma ville</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                        <h5>Mode de livraison</h5>
                                    </div>
                                    <div className="block-content-tunnel-space-flex"><label htmlFor="email-2">Livraison</label></div>
                                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                        <h5>Informations de paiement</h5>
                                    </div>
                                    <div className="block-content-tunnel">
                                        <div className="w-row">
                                            <div className="w-col w-col-6"><label htmlFor="email-2">Mode de paiement</label>
                                                <p className="label-tunnel">VISA 4242<br />01/2025</p>
                                            </div>
                                            <div className="w-col w-col-6"><label htmlFor="email-2">Adresse de facturation</label>
                                                <p className="label-tunnel">Mon adresse<br />Mon appartement<br />Mon code postal<br />Ma ville</p>
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
                                                            <h6 className="heading-9"></h6>
                                                            <div className="div-block-prix">
                                                                <div className="price-2"></div>
                                                                <div className="price-2 sale"></div>
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
                                <h5>TODOTRAD Détail de la commande</h5>
                            </div>
                            <div className="block-content-tunnel">
                                <div>
                                    <div className="w-row">
                                        <div className="w-col w-col-6 w-col-medium-6 w-col-small-6 w-col-tiny-6">
                                            <p className="label-tunnel">Sous Total</p>
                                        </div>
                                        <div className="w-col w-col-6 w-col-medium-6 w-col-small-6 w-col-tiny-6">
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
        </Layout>
    );
}