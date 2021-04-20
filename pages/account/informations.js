import { useState }                          from 'react';
import Head                                  from 'next/head';
import AccountLayout                         from '@components/account/AccountLayout';
import { setUser, setAddressesUser }         from '@lib/aquila-connector/user';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ req }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/account/login?redirect=' + encodeURI('/account/informations'));
    }
    const pageProps      = await dispatcher();
    pageProps.props.user = user;
    return pageProps;
}

export default function Account({ user }) {
    const [message, setMessage] = useState();

    const onSetUser = async (e) => {
        e.preventDefault();

        const updateUser = {
            _id             : user._id,
            firstname       : e.currentTarget.firstname.value,
            lastname        : e.currentTarget.lastname.value,
            email           : e.currentTarget.email.value,
            phone           : e.currentTarget.phone.value,
            billing_address : 0,
            delivery_address: 1
        };

        const addresses = [
            {
                firstname     : e.currentTarget.billing_address_firstname.value,
                lastname      : e.currentTarget.billing_address_lastname.value,
                line1         : e.currentTarget.billing_address_line1.value,
                line2         : e.currentTarget.billing_address_line2.value,
                city          : e.currentTarget.billing_address_city.value,
                zipcode       : e.currentTarget.billing_address_zipcode.value,
                isoCountryCode: e.currentTarget.billing_address_isoCountryCode.value
            },
            {
                firstname     : e.currentTarget.delivery_address_firstname.value,
                lastname      : e.currentTarget.delivery_address_lastname.value,
                line1         : e.currentTarget.delivery_address_line1.value,
                line2         : e.currentTarget.delivery_address_line2.value,
                city          : e.currentTarget.delivery_address_city.value,
                zipcode       : e.currentTarget.delivery_address_zipcode.value,
                isoCountryCode: e.currentTarget.delivery_address_isoCountryCode.value
            }
        ];

        try {
            await setUser(updateUser);
            await setAddressesUser(updateUser._id, updateUser.billing_address, updateUser.delivery_address, addresses);
            setMessage({ type: 'info', message: 'Informations enregistrées' });
        } catch (err) {
            setMessage({ type: 'error', message: err.message || 'Erreur inconnue' });
        }
    };

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
                    <form onSubmit={onSetUser}>
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>Vos informations</h5><label htmlFor="email-4" className="required">* Obligatoire</label>
                        </div>
                        <div className="block-content-tunnel">
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label htmlFor="email-3">Nom *</label>
                                    <input type="text" className="input-field w-input" name="firstname" defaultValue={user.firstname} maxLength={256} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label htmlFor="email-4">Prénom *</label>
                                    <input type="text" className="input-field w-input" name="lastname" defaultValue={user.lastname} maxLength={256} required />
                                </div>
                            </div>
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label htmlFor="email-4">Email *</label>
                                    <input type="email" className="input-field w-input" name="email" defaultValue={user.email} maxLength={256} required disabled />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label htmlFor="email-4">Tél *</label>
                                    <input type="text" className="input-field w-input" name="phone" defaultValue={user.phone} maxLength={256} required />
                                </div>
                            </div>
                            {/* <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Mot de passe actuel</label><input type="text" name="address_city" required className="w-commerce-commercecheckoutshippingcity input-field" /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label htmlFor="email-4">Nouveau mot de passe</label><input type="text" name="address_state" className="w-commerce-commercecheckoutshippingstateprovince input-field" /></div>
                            </div> */}
                        </div>
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>Adresse de livraison</h5><label htmlFor="email-4" className="required">* Obligatoire</label>
                        </div>
                        <div className="block-content-tunnel">
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label htmlFor="email-4">Prénom *</label>
                                    <input type="text" className="input-field w-input" name="delivery_address_firstname" defaultValue={user.addresses[user.delivery_address]?.firstname} maxLength={256} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label htmlFor="email-4">Nom *</label>
                                    <input type="text" className="input-field w-input" name="delivery_address_lastname" defaultValue={user.addresses[user.delivery_address]?.lastname} maxLength={256} required />
                                </div>
                            </div>
                            <label htmlFor="email-4" className="field-label">Adresse *</label>
                            <input type="text" className="input-field w-input" name="delivery_address_line1" defaultValue={user.addresses[user.delivery_address]?.line1} maxLength={256} required />
                            <label htmlFor="email-4" className="field-label">Adresse 2*</label>
                            <input type="text" className="input-field w-input" name="delivery_address_line2" defaultValue={user.addresses[user.delivery_address]?.line2} maxLength={256} required />
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-commerce-commercecheckoutlabel field-label">Ville *</label>
                                    <input type="text" className="w-commerce-commercecheckoutshippingcity input-field" name="delivery_address_city" defaultValue={user.addresses[user.delivery_address]?.city} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-commerce-commercecheckoutlabel field-label">Code postal *</label>
                                    <input type="text" className="w-commerce-commercecheckoutshippingzippostalcode input-field" name="delivery_address_zipcode" defaultValue={user.addresses[user.delivery_address]?.zipcode} required />
                                </div>
                            </div>
                            <label className="w-commerce-commercecheckoutlabel field-label">Pays *</label>
                            <select name="delivery_address_isoCountryCode" className="w-commerce-commercecheckoutshippingcountryselector dropdown">
                                <option value="FR">France</option>
                            </select>
                        </div>
                        
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>Adresse de facturation</h5><label htmlFor="email-4" className="required">* Obligatoire</label>
                        </div>
                        <div className="block-content-tunnel">
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label htmlFor="email-4">Prénom *</label>
                                    <input type="text" className="input-field w-input" name="billing_address_firstname" defaultValue={user.addresses[user.billing_address]?.firstname} maxLength={256} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label htmlFor="email-4">Nom *</label>
                                    <input type="text" className="input-field w-input" name="billing_address_lastname" defaultValue={user.addresses[user.billing_address]?.lastname} maxLength={256} required />
                                </div>
                            </div>
                            <label htmlFor="email-4" className="field-label">Adresse *</label>
                            <input type="text" className="input-field w-input" name="billing_address_line1" defaultValue={user.addresses[user.billing_address]?.line1} maxLength={256} required />
                            <label htmlFor="email-4" className="field-label">Adresse 2 *</label>
                            <input type="text" className="input-field w-input" name="billing_address_line2" defaultValue={user.addresses[user.billing_address]?.line2} maxLength={256} required />
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-commerce-commercecheckoutlabel field-label">Ville *</label>
                                    <input type="text" className="w-commerce-commercecheckoutshippingcity input-field" name="billing_address_city" defaultValue={user.addresses[user.billing_address]?.city} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-commerce-commercecheckoutlabel field-label">Code postal *</label>
                                    <input type="text" className="w-commerce-commercecheckoutshippingzippostalcode input-field" name="billing_address_zipcode" defaultValue={user.addresses[user.billing_address]?.zipcode} required />
                                </div>
                            </div>
                            <label className="w-commerce-commercecheckoutlabel field-label">Pays *</label>
                            <select className="w-commerce-commercecheckoutshippingcountryselector dropdown" name="billing_address_isoCountryCode">
                                <option value="FR">France</option>
                            </select>
                        </div>
                        
                        <button type="submit" className="submit-button-tunnel w-button">ENREGISTRER</button>
                    </form>
                    {
                        message && (
                            <div className={`w-commerce-commerce${message.type}`}>
                                <div>
                                    {message.message}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>


        </AccountLayout>
    );
}
