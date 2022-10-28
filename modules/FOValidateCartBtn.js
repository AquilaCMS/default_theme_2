import Link           from 'next/link';
import useTranslation from 'next-translate/useTranslation';

export default function POSValidateCartBtn() {

    const { t } = useTranslation();

    return (
        <div>
            <Link href="/checkout/clickandcollect" className="checkout-button-2 w-button">
                {t('components/cart:cartListItem.ordering')}
            </Link>
        </div>
    );
}