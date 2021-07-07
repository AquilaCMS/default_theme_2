import { useEffect, useState }               from 'react';
import useTranslation                        from 'next-translate/useTranslation';
import AccountLayout                         from '@components/account/AccountLayout';
import Button                                from '@components/ui/Button';
import NextSeoCustom                         from '@components/tools/NextSeoCustom';
import { getNewsletter, setNewsletter }      from '@lib/aquila-connector/newsletter';
import { setUser, setAddressesUser }         from '@lib/aquila-connector/user';
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
    const [optinNewsletter, setOptinNewsletter] = useState(false);
    const [message, setMessage]                 = useState();
    const [isLoading, setIsLoading]             = useState(false);
    const { t }                                 = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getNewsletter(user.email);
                if (res?.segment?.length) {
                    setOptinNewsletter(res.segment.find((n) => n.name === 'DefaultNewsletter')?.optin || false);
                }
            } catch (err) {
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            }
        };
        fetchData();
    }, []);

    const onSetUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Get form data
        const updateUser = {
            _id             : user._id,
            firstname       : e.currentTarget.firstname.value,
            lastname        : e.currentTarget.lastname.value,
            phone_mobile    : e.currentTarget.phone_mobile.value,
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
            // Set user
            await setUser(updateUser);

            // Update newsletter
            await setNewsletter(user.email, 'DefaultNewsletter', optinNewsletter);

            // Set user addresses
            await setAddressesUser(updateUser._id, updateUser.billing_address, updateUser.delivery_address, addresses);
            setMessage({ type: 'info', message: t('common:message.saveData') });
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AccountLayout active="1">
            <NextSeoCustom
                noindex={true}
                title={t('pages/account/informations:title')}
                description=""
            />
            
            <div className="container-tunnel-01">
                <h2 className="heading-2-steps">{t('pages/account/informations:titleNav')}</h2>
            </div>
            <div className="container-account">
                <div className="div-block-tunnel w-form">
                    <form onSubmit={onSetUser}>
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>{t('pages/account/informations:titleInformation')}</h5>
                            <label className="required">{t('pages/account/informations:mandatory')}</label>
                        </div>
                        <div className="block-content-tunnel">
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label>{t('pages/account/informations:name')}</label>
                                    <input type="text" className="input-field w-input" name="firstname" defaultValue={user.firstname} maxLength={256} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label>{t('pages/account/informations:firstname')}</label>
                                    <input type="text" className="input-field w-input" name="lastname" defaultValue={user.lastname} maxLength={256} required />
                                </div>
                            </div>
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label>{t('pages/account/informations:email')}</label>
                                    <input type="email" className="input-field w-input" name="email" defaultValue={user.email} maxLength={256} required disabled />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label>{t('pages/account/informations:phone')}</label>
                                    <input type="text" className="input-field w-input" name="phone_mobile" defaultValue={user.phone_mobile} maxLength={256} required />
                                </div>
                            </div>
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-checkbox checkbox-field-allergene">
                                        <input 
                                            type="checkbox"
                                            name="newsletter"
                                            checked={optinNewsletter}
                                            onChange={(e) => setOptinNewsletter(e.target.checked)}
                                            style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                        />
                                        <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene"></div>
                                        <span className="checkbox-label-allergene w-form-label">{t('pages/account/informations:newsletter')}</span>
                                    </label>
                                </div>
                            </div>
                            {/* <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn"><label>Mot de passe actuel</label><input type="text" name="address_city" required className="w-commerce-commercecheckoutshippingcity input-field" /></div>
                                <div className="w-commerce-commercecheckoutcolumn"><label>Nouveau mot de passe</label><input type="text" name="address_state" className="w-commerce-commercecheckoutshippingstateprovince input-field" /></div>
                            </div> */}
                        </div>
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>{t('pages/account/informations:titleDelivery')}</h5>
                            <label className="required">{t('pages/account/informations:mandatory')}</label>
                        </div>
                        <div className="block-content-tunnel">
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label>{t('pages/account/informations:firstname')}</label>
                                    <input type="text" className="input-field w-input" name="delivery_address_firstname" defaultValue={user.addresses[user.delivery_address]?.firstname} maxLength={256} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label>{t('pages/account/informations:name')}</label>
                                    <input type="text" className="input-field w-input" name="delivery_address_lastname" defaultValue={user.addresses[user.delivery_address]?.lastname} maxLength={256} required />
                                </div>
                            </div>
                            <label className="field-label">{t('pages/account/informations:address')}</label>
                            <input type="text" className="input-field w-input" name="delivery_address_line1" defaultValue={user.addresses[user.delivery_address]?.line1} maxLength={256} required />
                            <label className="field-label">{t('pages/account/informations:address2')}</label>
                            <input type="text" className="input-field w-input" name="delivery_address_line2" defaultValue={user.addresses[user.delivery_address]?.line2} maxLength={256} required />
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/account/informations:city')}</label>
                                    <input type="text" className="w-commerce-commercecheckoutshippingcity input-field" name="delivery_address_city" defaultValue={user.addresses[user.delivery_address]?.city} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/account/informations:postal')}</label>
                                    <input type="text" className="w-commerce-commercecheckoutshippingzippostalcode input-field" name="delivery_address_zipcode" defaultValue={user.addresses[user.delivery_address]?.zipcode} required />
                                </div>
                            </div>
                            <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/account/informations:country')}</label>
                            <select name="delivery_address_isoCountryCode" className="w-commerce-commercecheckoutshippingcountryselector dropdown">
                                <option value="FR">France</option>
                            </select>
                        </div>
                        
                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                            <h5>{t('pages/account/informations:titleBilling')}</h5>
                            <label className="required">{t('pages/account/informations:mandatory')}</label>
                        </div>
                        <div className="block-content-tunnel">
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label>{t('pages/account/informations:firstname')}</label>
                                    <input type="text" className="input-field w-input" name="billing_address_firstname" defaultValue={user.addresses[user.billing_address]?.firstname} maxLength={256} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label>{t('pages/account/informations:name')}</label>
                                    <input type="text" className="input-field w-input" name="billing_address_lastname" defaultValue={user.addresses[user.billing_address]?.lastname} maxLength={256} required />
                                </div>
                            </div>
                            <label className="field-label">{t('pages/account/informations:address')}</label>
                            <input type="text" className="input-field w-input" name="billing_address_line1" defaultValue={user.addresses[user.billing_address]?.line1} maxLength={256} required />
                            <label className="field-label">{t('pages/account/informations:address2')}</label>
                            <input type="text" className="input-field w-input" name="billing_address_line2" defaultValue={user.addresses[user.billing_address]?.line2} maxLength={256} required />
                            <div className="w-commerce-commercecheckoutrow">
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/account/informations:city')}</label>
                                    <input type="text" className="w-commerce-commercecheckoutshippingcity input-field" name="billing_address_city" defaultValue={user.addresses[user.billing_address]?.city} required />
                                </div>
                                <div className="w-commerce-commercecheckoutcolumn">
                                    <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/account/informations:postal')}</label>
                                    <input type="text" className="w-commerce-commercecheckoutshippingzippostalcode input-field" name="billing_address_zipcode" defaultValue={user.addresses[user.billing_address]?.zipcode} required />
                                </div>
                            </div>
                            <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/account/informations:country')}</label>
                            <select className="w-commerce-commercecheckoutshippingcountryselector dropdown" name="billing_address_isoCountryCode">
                                <option value="FR">France</option>
                            </select>
                        </div>
                        
                        <Button 
                            text={t('pages/account/informations:save')}
                            loadingText={t('pages/account/informations:saveLoading')}
                            isLoading={isLoading}
                            className="submit-button-tunnel w-button"
                        />
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
