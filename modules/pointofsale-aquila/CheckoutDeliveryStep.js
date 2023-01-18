import { useEffect, useState } from 'react';
import Link                    from 'next/link';
import { useRouter }           from 'next/router';
import useTranslation          from 'next-translate/useTranslation';
import ClickAndCollect         from './ClickAndCollect';
import Button                  from '@components/ui/Button';
import { setUser }             from '@aquilacms/aquila-connector/api/user';
import { useCart }             from '@lib/hooks';
import { formatPrice }         from '@lib/utils';

export default function CheckoutDeliveryStep({ user }) {
    const [show, setShow]           = useState(false);
    const [message, setMessage]     = useState();
    const [isLoading, setIsLoading] = useState(false);
    const router                    = useRouter();
    const { cart }                  = useCart();
    const { t }                     = useTranslation();

    useEffect(() => {
        // Check if the cart is empty
        if (!cart.items || !cart.items.length) {
            router.push('/');
        } else if (!cart.addresses || !cart.addresses.billing) {
            // Check if the billing address exists
            router.push('/checkout/address');
        } else if (cart.items.filter((item) => !item.typeDisplay).every((item) => item.type.startsWith('virtual'))) {
            // If have only virtual products, go to payment step
            router.push('/checkout/payment');
        } else {
            setShow(true);
        }
    }, []);

    const nextStep = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const postForm = e.currentTarget;

        // Check if click & collect is validated
        if (!cart.orderReceipt?.date) {
            return setMessage({ type: 'error', message: t('modules/pointofsale-aquila:checkoutDeliveryStep.submitError') });
        }

        // Check if the date of receipt is consistent
        if (cart.orderReceipt.date) {
            const now         = Date.now() / 1000;
            const receiptDate = new Date(cart.orderReceipt.date).getTime() / 1000;
            if (receiptDate - now <= 0) {
                return setMessage({ type: 'error', message: t('modules/pointofsale-aquila:checkoutDeliveryStep.submitError2') });
            }
        }

        // Update phone mobile user
        const updateUser = {
            _id         : user._id,
            phone_mobile: postForm.phone_mobile.value
        };
        try {
            await setUser(updateUser);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }

        router.push('/checkout/payment');
    };

    if (!show) {
        return null;
    }

    return (
        <>
            <ClickAndCollect />

            <form onSubmit={nextStep}>
                <div className="log-label"></div>
                <div className="w-form w-commerce-commercecartfooter">
                    <div><label>{t('modules/pointofsale-aquila:checkoutDeliveryStep.labelPhone')}</label><input type="text" className="w-input" maxLength={256} name="phone_mobile" defaultValue={user.phone_mobile} required /></div>
                </div>
                <div className="w-commerce-commercecartfooter">
                    {
                        cart.delivery?.value && (
                            <div className="w-commerce-commercecartlineitem cart-line-item">
                                <div>{t('components/cart:cartListItem.delivery')}</div>
                                <div>{formatPrice(cart.delivery.value.ati)}</div>
                            </div>
                        )
                    }
                    <div className="w-commerce-commercecartlineitem cart-line-item">
                        <div>{t('components/cart:cartListItem.total')}</div>
                        <div className="w-commerce-commercecartordervalue text-block">
                            {formatPrice(cart.priceTotal.ati)}
                        </div>
                    </div>
                </div>
                <div className="form-mode-paiement-tunnel">
                    <Link href="/checkout/address" className="log-button-03 w-button">
                        {t('modules/pointofsale-aquila:checkoutDeliveryStep.previous')}
                    </Link>
                    &nbsp;
                    {
                        cart.orderReceipt?.date && (
                            <Button
                                text={t('modules/pointofsale-aquila:checkoutDeliveryStep.next')}
                                loadingText={t('modules/pointofsale-aquila:checkoutDeliveryStep.nextLoading')}
                                isLoading={isLoading}
                                className="log-button-03 w-button"
                            />
                        )
                    }
                </div>  
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