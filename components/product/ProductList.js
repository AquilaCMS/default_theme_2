import crypto               from 'crypto';
import useTranslation       from 'next-translate/useTranslation';
import ProductCard          from '@components/product/ProductCard';
import { useComponentData } from '@lib/hooks';

export default function ProductList({ type, value }) {
    const componentData = useComponentData();
    const { t }         = useTranslation();

    // 2 options :
    // Live use in code (data in "value" prop => type = "data")
    // Use in CMS block (data in redux store => SET_COMPONENT_DATA => type = "category|new|product_id|product_code|list_id|list_code")
    let productList = [];
    if (type === 'data') {
        productList = value;
    }
    else {
        const hash  = crypto.createHash('md5').update(`${type}_${value}`).digest('hex');
        productList = componentData[`nsProductList_${hash}`];
    }

    if (!productList?.length) {
        return (
            <div className="w-dyn-empty">
                <div>{t('components/product:productList.noProduct')}</div>
            </div>
        );
    }

    return (
        <div role="list" className="order-collection w-dyn-items w-row">
            {productList.map((item) => (
                <ProductCard key={item._id} type="data" value={item} />
            ))}
        </div>
    );
}