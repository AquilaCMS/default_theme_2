import Head                                  from 'next/head';
import AccountLayout                         from '@components/account/AccountLayout';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ req, res }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/account/login?redirect=' + encodeURI('/account/informations'));
    }
    const pageProps      = await dispatcher(req, res);
    pageProps.props.user = user;
    return pageProps;
}

export default function Account({ user }) {
    return (
        <AccountLayout>
            <Head>
                <title>Mes informations</title>
            </Head>

            <div className="container-tunnel-01">
                <h2 className="heading-2-steps">Informations client</h2>
            </div>
            <div className="container-account">
                <div className="div-block-tunnel w-form">
                    <form>
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>Vos informations</h5><label htmlFor="email-4" className="required">* Obligatoire</label>
                        </div>
                        <div className="block-content-tunnel">
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-3">Nom *</label><input type="text" className="input-field w-input" defaultValue={user.firstname} maxLength={256} name="firstname" placeholder="" required /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Prénom *</label><input type="text" className="input-field w-input" defaultValue={user.lastname} maxLength={256} name="lastname" placeholder="" required /></div>
                            </div>
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Email *</label><input type="email" className="input-field w-input" maxLength={256} defaultValue={user.email} name="email" placeholder="" required /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Tel *</label><input type="text" className="input-field w-input" maxLength={256} name="email-3" placeholder="" required /></div>
                            </div>
                            {/* <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Mot de passe actuel</label><input type="text" name="address_city" required className="w-commerce-commercecheckoutshippingcity input-field" /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Nouveau mot de passe</label><input type="text" name="address_state" className="w-commerce-commercecheckoutshippingstateprovince input-field" /></div>
                            </div> */}
                        </div>
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>Adresse</h5><label htmlFor="email-4" className="required">* Obligatoire</label>
                        </div>
                        <div className="block-content-tunnel"><label htmlFor="email-4" className="field-label">Adresse *</label><input type="email" className="input-field w-input" maxLength={256} name="email-3" placeholder="" id="name" required /><label htmlFor="email-4" className="field-label">Adresse 2*</label><input type="email" className="input-field w-input" maxLength={256} name="email-3" placeholder="" id="adresse" required />
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn"><label className="w-commerce-commercecheckoutlabel field-label">Ville *</label><input type="text" name="address_city" required className="w-commerce-commercecheckoutshippingcity input-field" /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label className="w-commerce-commercecheckoutlabel field-label">Département</label><input type="text" name="address_state" className="w-commerce-commercecheckoutshippingstateprovince input-field" /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label className="w-commerce-commercecheckoutlabel field-label">Code postal *</label><input type="text" name="address_zip" required className="w-commerce-commercecheckoutshippingzippostalcode input-field" /></div>
                            </div><label className="w-commerce-commercecheckoutlabel field-label">Pays *</label><select name="address_country" className="w-commerce-commercecheckoutshippingcountryselector dropdown">
                                <option value="FR">France</option>
                            </select>
                        </div>
                        
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>Adresse de facturation</h5><label htmlFor="email-4" className="required">* Obligatoire</label>
                        </div>
                        <div className="block-content-tunnel">
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Nom *</label><input type="email" className="input-field w-input" maxLength={256} name="email-3" placeholder="" id="name" required /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Prénom *</label><input type="email" className="input-field w-input" maxLength={256} name="email-3" placeholder="" id="firstname" required /></div>
                            </div><label htmlFor="email-4" className="field-label">Adresse *</label><input type="email" className="input-field w-input" maxLength={256} name="email-3" placeholder="" id="adresse" required />
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn"><label className="w-commerce-commercecheckoutlabel field-label">Ville *</label><input type="text" name="address_city" required className="w-commerce-commercecheckoutshippingcity input-field" /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label className="w-commerce-commercecheckoutlabel field-label">Département</label><input type="text" name="address_state" className="w-commerce-commercecheckoutshippingstateprovince input-field" /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label className="w-commerce-commercecheckoutlabel field-label">Code postal *</label><input type="text" name="address_zip" required className="w-commerce-commercecheckoutshippingzippostalcode input-field" /></div>
                            </div><label className="w-commerce-commercecheckoutlabel field-label">Pays *</label><select name="address_country" className="w-commerce-commercecheckoutshippingcountryselector dropdown">
                                <option value="FR">France</option>
                            </select>
                        </div>
                    </form>
                    <div className="w-form-done">
                        <div>Thank you! Your submission has been received!</div>
                    </div>
                    <div className="w-form-fail">
                        <div>Oops! Something went wrong while submitting the form.</div>
                    </div>
                </div>
                <a href="checkout-page-confirmation.html" className="submit-button-tunnel w-button">ENREGISTRER</a>
            </div>


        </AccountLayout>
    );
}
