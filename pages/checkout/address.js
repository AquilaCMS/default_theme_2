import { useEffect, useState }                                         from 'react';
import { useRouter }                                                   from 'next/router';
import useTranslation                                                  from 'next-translate/useTranslation';
import Button                                                          from '@components/ui/Button';
import LightLayout                                                     from '@components/layouts/LightLayout';
import NextSeoCustom                                                   from '@components/tools/NextSeoCustom';
import { setCartAddresses }                                            from '@aquilacms/aquila-connector/api/cart';
import { setAddressesUser }                                            from '@aquilacms/aquila-connector/api/user';
import { useCart }                                                     from '@lib/hooks';
import { setLangAxios, authProtectedPage, serverRedirect, moduleHook } from '@lib/utils';
import { dispatcher }                                                  from '@lib/redux/dispatcher';

export async function getServerSideProps({ locale, req, res }) {
    setLangAxios(locale, req, res);

    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI(moduleHook('cart-validate-btn') ? '/checkout/clickandcollect' : '/checkout/address'));
    }
    const pageProps      = await dispatcher(locale, req, res);
    pageProps.props.user = user;
    return pageProps;
}

export default function CheckoutAddress({ user }) {
    const [sameAddress, setSameAddress] = useState(false);
    const [message, setMessage]         = useState();
    const [isLoading, setIsLoading]     = useState(false);
    const router                        = useRouter();
    const { cart, setCart }             = useCart();
    const { t }                         = useTranslation();
    
    useEffect(() => {
        // Check if the cart is empty
        if (!cart?.items?.length) {
            router.push('/');
        }
        const billingAddress  = user.addresses[user.billing_address];
        const deliveryAddress = user.addresses[user.delivery_address];
        if (billingAddress) {
            delete billingAddress['_id'];
        }
        if (deliveryAddress){
            delete deliveryAddress['_id'];
        }
        if (JSON.stringify(billingAddress) === JSON.stringify(deliveryAddress)) { 
            setSameAddress(true);
        }
    },[]);

    const onSubmitAddress = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const postForm = e.currentTarget;

        // Get form data
        let addresses = [];
        if (moduleHook('cart-validate-btn')) {
            addresses = [
                {
                    firstname     : postForm.billing_address_firstname.value,
                    lastname      : postForm.billing_address_lastname.value,
                    line1         : postForm.billing_address_line1.value,
                    line2         : postForm.billing_address_line2.value,
                    city          : postForm.billing_address_city.value,
                    zipcode       : postForm.billing_address_zipcode.value,
                    isoCountryCode: postForm.billing_address_isoCountryCode.value
                }
            ];
            addresses.push(user.addresses[user.delivery_address] ? user.addresses[user.delivery_address] : {});
        } else {
            const deliveryAddress = {
                firstname     : postForm.delivery_address_firstname.value,
                lastname      : postForm.delivery_address_lastname.value,
                line1         : postForm.delivery_address_line1.value,
                line2         : postForm.delivery_address_line2.value,
                city          : postForm.delivery_address_city.value,
                zipcode       : postForm.delivery_address_zipcode.value,
                isoCountryCode: postForm.delivery_address_isoCountryCode.value
            };
            if (sameAddress) {
                addresses = [deliveryAddress, deliveryAddress];
            } else {
                const billingAddress = {
                    firstname     : postForm.billing_address_firstname.value,
                    lastname      : postForm.billing_address_lastname.value,
                    line1         : postForm.billing_address_line1.value,
                    line2         : postForm.billing_address_line2.value,
                    city          : postForm.billing_address_city.value,
                    zipcode       : postForm.billing_address_zipcode.value,
                    isoCountryCode: postForm.billing_address_isoCountryCode.value
                };
                addresses            = [billingAddress, deliveryAddress];
            }
        }

        try {
            // Set user addresses
            await setAddressesUser(user._id, 0, 1, addresses);

            // Set cart addresses
            const newCart = await setCartAddresses(cart._id, { billing: addresses[0], delivery: moduleHook('cart-validate-btn') ? cart.addresses.delivery : addresses[1] });
            setCart(newCart);

            router.push(moduleHook('cart-validate-btn') ? '/checkout/payment' : '/checkout/delivery');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    const previousStep = () => {
        router.back();
    };

    if (!cart?.items?.length) {
        return null;
    }
    
    return (
        <LightLayout>
            <NextSeoCustom
                noindex={true}
                title={t('pages/checkout:address.title')}
                description={t('pages/checkout:address.description')}
            />
            
            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">{t('pages/checkout:address.titleH1')}</h1>
                    </div>
                </div>
            </div>

            <div className="section-tunnel">
                <div className="container-tunnel">
                    <div className="container-step w-container">
                        <h2 className="heading-steps">{moduleHook('cart-validate-btn') ? 3 : 2}</h2>
                        <h2 className="heading-2-steps">{t('pages/checkout:address.step3')}</h2>
                    </div>
                    
                    <form className="form-mode-paiement-tunnel" onSubmit={onSubmitAddress}>
                        <div style={{ width: '100%' }}>
                            {
                                !moduleHook('cart-validate-btn') ? (
                                    <>
                                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                            <h5>{t('pages/checkout:address.titleDelivery')}</h5>
                                            <label className="required">* {t('pages/checkout:address.mandatory')}</label>
                                        </div>
                                        <div className="block-content-tunnel">
                                            <div className="w-commerce-commercecheckoutrow">
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label>{t('pages/checkout:address.firstname')} *</label>
                                                    <input type="text" className="input-field w-input" name="delivery_address_firstname" defaultValue={user.addresses[user.delivery_address]?.firstname} maxLength={256} required />
                                                </div>
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label>{t('pages/checkout:address.lastname')} *</label>
                                                    <input type="text" className="input-field w-input" name="delivery_address_lastname" defaultValue={user.addresses[user.delivery_address]?.lastname} maxLength={256} required />
                                                </div>
                                            </div>
                                            <label className="field-label">{t('pages/checkout:address.line1')} *</label>
                                            <input type="text" className="input-field w-input" name="delivery_address_line1" defaultValue={user.addresses[user.delivery_address]?.line1} maxLength={256} required />
                                            <label className="field-label">{t('pages/checkout:address.line2')}</label>
                                            <input type="text" className="input-field w-input" name="delivery_address_line2" defaultValue={user.addresses[user.delivery_address]?.line2} maxLength={256} />
                                            <div className="w-commerce-commercecheckoutrow">
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.city')} *</label>
                                                    <input type="text" className="w-commerce-commercecheckoutshippingcity input-field" name="delivery_address_city" defaultValue={user.addresses[user.delivery_address]?.city} required />
                                                </div>
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.postal')} *</label>
                                                    <input type="text" className="w-commerce-commercecheckoutshippingzippostalcode input-field" name="delivery_address_zipcode" defaultValue={user.addresses[user.delivery_address]?.zipcode} required />
                                                </div>
                                            </div>
                                            <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.country')} *</label>
                                            <select name="delivery_address_isoCountryCode" className="w-commerce-commercecheckoutshippingcountryselector dropdown">
                                                <option value="FR">France</option>
                                            </select>
                                            <br />
                                            <div className="w-commerce-commercecheckoutrow">
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label className="w-checkbox checkbox-field-allergene">
                                                        <input 
                                                            type="checkbox"
                                                            name="sameAddress"
                                                            checked={sameAddress}
                                                            onChange={(e) => setSameAddress(e.target.checked)}
                                                            style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                                        />
                                                        <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene"></div>
                                                        <span className="checkbox-label-allergene w-form-label">{t('pages/checkout:address.sameAddress')}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : null
                            }
                            {
                                sameAddress === false && (
                                    <>
                                        <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                            <h5>{t('pages/checkout:address.titleBilling')}</h5>
                                            <label className="required">* {t('pages/checkout:address.mandatory')}</label>
                                        </div>
                                        <div className="block-content-tunnel">
                                            <div className="w-commerce-commercecheckoutrow">
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label>{t('pages/checkout:address.firstname')} *</label>
                                                    <input type="text" className="input-field w-input" name="billing_address_firstname" defaultValue={user.addresses[user.billing_address]?.firstname} maxLength={256} required />
                                                </div>
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label>{t('pages/checkout:address.lastname')} *</label>
                                                    <input type="text" className="input-field w-input" name="billing_address_lastname" defaultValue={user.addresses[user.billing_address]?.lastname} maxLength={256} required />
                                                </div>
                                            </div>
                                            <label className="field-label">{t('pages/checkout:address.line1')} *</label>
                                            <input type="text" className="input-field w-input" name="billing_address_line1" defaultValue={user.addresses[user.billing_address]?.line1} maxLength={256} required />
                                            <label className="field-label">{t('pages/checkout:address.line2')}</label>
                                            <input type="text" className="input-field w-input" name="billing_address_line2" defaultValue={user.addresses[user.billing_address]?.line2} maxLength={256} />
                                            <div className="w-commerce-commercecheckoutrow">
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.city')} *</label>
                                                    <input type="text" className="w-commerce-commercecheckoutshippingcity input-field" name="billing_address_city" defaultValue={user.addresses[user.billing_address]?.city} required />
                                                </div>
                                                <div className="w-commerce-commercecheckoutcolumn">
                                                    <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.postal')} *</label>
                                                    <input type="text" className="w-commerce-commercecheckoutshippingzippostalcode input-field" name="billing_address_zipcode" defaultValue={user.addresses[user.billing_address]?.zipcode} required />
                                                </div>
                                            </div>
                                            <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.country')} *</label>
                                            <select className="w-commerce-commercecheckoutshippingcountryselector dropdown" name="billing_address_isoCountryCode">
                                                <option value="FR">France</option>
                                            </select>
                                        </div>
                                    </>
                                )
                            }
                            
                        </div>

                        <button type="button" className="log-button-03 w-button" onClick={previousStep}>{t('pages/checkout:payment.previous')}</button>
                        &nbsp;
                        <Button 
                            text={t('pages/checkout:address.next')}
                            loadingText={t('pages/checkout:address.nextLoading')}
                            isLoading={isLoading}
                            className="log-button-03 w-button"
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
        </LightLayout>
    );
}