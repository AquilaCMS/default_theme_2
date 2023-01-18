import { useEffect, useState }  from 'react';
import Link                     from 'next/link';
import { useRouter }            from 'next/router';
import useTranslation           from 'next-translate/useTranslation';
import Button                   from '@components/ui/Button';
import { setCartAddresses }     from '@aquilacms/aquila-connector/api/cart';
import { setAddressesUser }     from '@aquilacms/aquila-connector/api/user';
import { useCart }              from '@lib/hooks';
import { isAllVirtualProducts } from '@lib/utils';

export default function CheckoutAddressStep({ user }) {
    const [message, setMessage]     = useState();
    const [isLoading, setIsLoading] = useState(false);
    const router                    = useRouter();
    const { cart, setCart }         = useCart();
    const { t }                     = useTranslation();

    useEffect(() => {
        // Check if the cart is empty
        if (!cart.items || !cart.items.length) {
            router.push('/');
        }
    }, []);

    const onSubmitAddress = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const postForm = e.currentTarget;

        // Get form data
        let addresses = [];
        addresses     = [
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

        try {
            // Set user addresses
            await setAddressesUser(user._id, 0, 1, addresses);

            // Set cart addresses
            const newCart = await setCartAddresses(cart._id, { billing: addresses[0], delivery: cart.addresses?.delivery ? cart.addresses.delivery : {} });
            setCart(newCart);

            router.push(isAllVirtualProducts(cart) ? '/checkout/payment' : '/checkout/delivery');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    if (!cart.items || !cart.items.length) {
        return null;
    }

    return (
        <>
            <form className="form-mode-paiement-tunnel" onSubmit={onSubmitAddress}>
                <div style={{ width: '100%' }}>
                    <div className="w-commerce-commercecheckoutsummaryblockheader block-header">
                        <h5>{t('modules/pointofsale-aquila:checkoutAddressStep.titleBilling')}</h5>
                        <label className="required">* {t('modules/pointofsale-aquila:checkoutAddressStep.mandatory')}</label>
                    </div>
                    <div className="block-content-tunnel">
                        <div className="w-commerce-commercecheckoutrow">
                            <div className="w-commerce-commercecheckoutcolumn">
                                <label>{t('modules/pointofsale-aquila:checkoutAddressStep.firstname')} *</label>
                                <input type="text" className="input-field w-input" name="billing_address_firstname" defaultValue={user.addresses[user.billing_address]?.firstname} maxLength={256} required />
                            </div>
                            <div className="w-commerce-commercecheckoutcolumn">
                                <label>{t('modules/pointofsale-aquila:checkoutAddressStep.lastname')} *</label>
                                <input type="text" className="input-field w-input" name="billing_address_lastname" defaultValue={user.addresses[user.billing_address]?.lastname} maxLength={256} required />
                            </div>
                        </div>
                        <label className="field-label">{t('modules/pointofsale-aquila:checkoutAddressStep.line1')} *</label>
                        <input type="text" className="input-field w-input" name="billing_address_line1" defaultValue={user.addresses[user.billing_address]?.line1} maxLength={256} required />
                        <label className="field-label">{t('modules/pointofsale-aquila:checkoutAddressStep.line2')}</label>
                        <input type="text" className="input-field w-input" name="billing_address_line2" defaultValue={user.addresses[user.billing_address]?.line2} maxLength={256} />
                        <div className="w-commerce-commercecheckoutrow">
                            <div className="w-commerce-commercecheckoutcolumn">
                                <label className="w-commerce-commercecheckoutlabel field-label">{t('modules/pointofsale-aquila:checkoutAddressStep.city')} *</label>
                                <input type="text" className="w-commerce-commercecheckoutshippingcity input-field" name="billing_address_city" defaultValue={user.addresses[user.billing_address]?.city} required />
                            </div>
                            <div className="w-commerce-commercecheckoutcolumn">
                                <label className="w-commerce-commercecheckoutlabel field-label">{t('modules/pointofsale-aquila:checkoutAddressStep.postal')} *</label>
                                <input type="text" className="w-commerce-commercecheckoutshippingzippostalcode input-field" name="billing_address_zipcode" defaultValue={user.addresses[user.billing_address]?.zipcode} required />
                            </div>
                        </div>
                        <label className="w-commerce-commercecheckoutlabel field-label">{t('modules/pointofsale-aquila:checkoutAddressStep.country')} *</label>
                        <select className="w-commerce-commercecheckoutshippingcountryselector dropdown" name="billing_address_isoCountryCode">
                            <option value="FR">France</option>
                        </select>
                    </div>
                </div>

                <Link href="/checkout/cart" className="log-button-03 w-button">
                    {t('modules/pointofsale-aquila:checkoutAddressStep.previous')}
                </Link>
                &nbsp;
                <Button 
                    text={t('modules/pointofsale-aquila:checkoutAddressStep.next')}
                    loadingText={t('modules/pointofsale-aquila:checkoutAddressStep.nextLoading')}
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
        </>
    );
}