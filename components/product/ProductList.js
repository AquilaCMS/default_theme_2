import crypto               from 'crypto';
import useTranslation       from 'next-translate/useTranslation';
import ProductCard          from '@components/product/ProductCard';
import { getImage }         from '@lib/aquila-connector/product/helpersProduct';
import { useComponentData } from '@lib/hooks';

export default function ProductList({ type, value }) {
    const componentData = useComponentData();
    const { lang, t }   = useTranslation();

    let productList = value;
    // If type <> data, get data in redux store
    if (type !== 'data') {
        const hash  = crypto.createHash('md5').update(`${type}_${value}`).digest('hex');
        productList = componentData[`nsProductList_${hash}`];
    }

    let haveItems = productList && productList.length > 0 ? true : false;
    if (!haveItems) {
        return (
            <div className="w-dyn-empty">
                <div>{t('components/product:productList.noProduct')}</div>
            </div>
        );
    }

    return (
        <div role="list" className="order-collection w-dyn-items w-row">
            {productList.map((item) => (
                <ProductCard
                    key={item._id}
                    product={{
                        ...item,
                        key        : item._id,
                        slug       : item.slug ? item.slug[lang] : '',
                        name       : item.name,
                        description: item.description2?.title,
                        img        : getImage(item.images[0], '250x250')
                    }}
                />
            ))}
        </div>
    );
}