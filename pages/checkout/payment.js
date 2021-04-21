import Head                                  from 'next/head';
import Router                                from 'next/router';
import LightLayout                           from '@components/layouts/LightLayout';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ req }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI('/checkout/clickandcollect'));
    }
    return dispatcher();
}

export default function CheckoutPayment() {
    const previousStep = () => {
        Router.back();
    };

    return (
        <LightLayout>
            <Head>
                <title>Ma commande - Moyen de paiement</title>
                <meta name="description" content="TODO" />
            </Head>

            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">Ma commande</h1>
                    </div>
                </div>
            </div>

            <div className="section-tunnel">
                <div className="container-tunnel">
                    <div className="container-step w-container">
                        <h2 className="heading-steps">3</h2>
                        <h2 className="heading-2-steps">Moyen de paiement</h2>
                    </div>
                    <div className="col-log w-row">
                        <form id="email-form-2" name="email-form-2" data-name="Email Form 2" className="form-mode-paiement-tunnel">
                            <div className="columns-picker-paiement-tunnel w-row">
                                <div className="column-center w-col w-col-6">
                                    <label className="checkbox-click-collect w-radio">
                                        <input type="radio" data-name="Radio" id="retrait" name="Radio" value="Radio" required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                        <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                        <span className="checkbox-label w-form-label">Paiement en ligne</span>
                                    </label>
                                </div>
                                <div className="column-center w-col w-col-6">
                                    <label className="checkbox-click-collect w-radio">
                                        <input type="radio" data-name="Radio" id="retrait" name="Radio" value="Radio" required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                        <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                        <span className="checkbox-label w-form-label">Paiement au restaurant</span>
                                    </label>
                                </div>
                            </div>
                            <button type="button" className="log-button-03 w-button" onClick={previousStep}>RETOUR</button>
                            &nbsp;
                            <button type="submit" className="log-button-03 w-button">PAYER</button>
                        </form>
                    </div>
                </div>
            </div>
        </LightLayout>
    );
}