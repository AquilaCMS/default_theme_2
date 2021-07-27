import { useEffect, useState }               from 'react';
import { useRouter }                         from 'next/router';
import useTranslation                        from 'next-translate/useTranslation';
import Button                                from '@components/ui/Button';
import LightLayout                           from '@components/layouts/LightLayout';
import NextSeoCustom                         from '@components/tools/NextSeoCustom';
import { setCartAddresses }                  from 'aquila-connector/api/cart';
import { setAddressesUser }                  from 'aquila-connector/api/user';
import { useCart }                           from '@lib/hooks';
import { authProtectedPage, serverRedirect } from '@lib/utils';
import { dispatcher }                        from '@lib/redux/dispatcher';

export async function getServerSideProps({ locale, req, res }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI('/checkout/clickandcollect'));
    }
    const pageProps      = await dispatcher(locale, req, res);
    pageProps.props.user = user;
    return pageProps;
}

export default function CheckoutAddress({ user }) {
    const [message, setMessage]     = useState();
    const [isLoading, setIsLoading] = useState(false);
    const router                    = useRouter();
    const { cart, setCart }         = useCart();
    const { t }                     = useTranslation();
    
    useEffect(() => {
        // Check if the cart is empty
        if (!cart?.items?.length) {
            router.push('/');
        }
    }, []);

    const onSubmitAddress = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Get form data
        const addresses = [
            {
                firstname     : e.currentTarget.billing_address_firstname.value,
                lastname      : e.currentTarget.billing_address_lastname.value,
                line1         : e.currentTarget.billing_address_line1.value,
                line2         : e.currentTarget.billing_address_line2.value,
                city          : e.currentTarget.billing_address_city.value,
                zipcode       : e.currentTarget.billing_address_zipcode.value,
                isoCountryCode: e.currentTarget.billing_address_isoCountryCode.value
            }
        ];
        addresses.push(user.addresses[user.delivery_address] ? user.addresses[user.delivery_address] : {});

        try {
            // Set user addresses
            await setAddressesUser(user._id, 0, 1, addresses);

            // Set cart addresses
            const newCart = await setCartAddresses(cart._id, { billing: addresses[0], delivery: cart.addresses.delivery });
            setCart(newCart);

            router.push('/checkout/payment');
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
                        <h2 className="heading-steps">3</h2>
                        <h2 className="heading-2-steps">{t('pages/checkout:address.address')}</h2>
                    </div>
                    
                    <form className="form-mode-paiement-tunnel" onSubmit={onSubmitAddress}>
                        <div style={{ width: '100%' }}>
                            <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                                <h5>{t('pages/checkout:address.titleBilling')}</h5>
                                <label className="required">{t('pages/checkout:address.mandatory')}</label>
                            </div>
                            <div className="block-content-tunnel">
                                <div className="w-commerce-commercecheckoutrow">
                                    <div className="w-commerce-commercecheckoutcolumn">
                                        <label>{t('pages/checkout:address.firstname')}</label>
                                        <input type="text" className="input-field w-input" name="billing_address_firstname" defaultValue={user.addresses[user.billing_address]?.firstname} maxLength={256} required />
                                    </div>
                                    <div className="w-commerce-commercecheckoutcolumn">
                                        <label>{t('pages/checkout:address.name')}</label>
                                        <input type="text" className="input-field w-input" name="billing_address_lastname" defaultValue={user.addresses[user.billing_address]?.lastname} maxLength={256} required />
                                    </div>
                                </div>
                                <label className="field-label">{t('pages/checkout:address.line1')}</label>
                                <input type="text" className="input-field w-input" name="billing_address_line1" defaultValue={user.addresses[user.billing_address]?.line1} maxLength={256} required />
                                <label className="field-label">{t('pages/checkout:address.line2')}</label>
                                <input type="text" className="input-field w-input" name="billing_address_line2" defaultValue={user.addresses[user.billing_address]?.line2} maxLength={256} />
                                <div className="w-commerce-commercecheckoutrow">
                                    <div className="w-commerce-commercecheckoutcolumn">
                                        <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.city')}</label>
                                        <input type="text" className="w-commerce-commercecheckoutshippingcity input-field" name="billing_address_city" defaultValue={user.addresses[user.billing_address]?.city} required />
                                    </div>
                                    <div className="w-commerce-commercecheckoutcolumn">
                                        <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.postal')}</label>
                                        <input type="text" className="w-commerce-commercecheckoutshippingzippostalcode input-field" name="billing_address_zipcode" defaultValue={user.addresses[user.billing_address]?.zipcode} required />
                                    </div>
                                </div>
                                <label className="w-commerce-commercecheckoutlabel field-label">{t('pages/checkout:address.country')}</label>
                                <select className="w-commerce-commercecheckoutshippingcountryselector dropdown" name="billing_address_isoCountryCode">
                                    <option value="FR">France</option>
                                </select>
                            </div>
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