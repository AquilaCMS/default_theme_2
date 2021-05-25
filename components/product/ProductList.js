import useTranslation from 'next-translate/useTranslation';
import ProductCard    from '@components/product/ProductCard';
import Pagination     from '@components/product/Pagination';
import { getImage }   from '@lib/aquila-connector/product/helpersProduct';


export default function ProductList({ productsList }) {
    const { lang, t } = useTranslation();

    let haveItems = productsList && productsList.length > 0 ? true : false;
    if (!haveItems) {
        return (
            <div className="w-dyn-empty">
                <div>{t('components/product:productList.noProduct')}</div>
            </div>
        );
    }

    return (
        <>

            <div role="list" className="order-collection w-dyn-items w-row">
                {productsList.map((item) => (
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

            <Pagination totalItems={productsList.length} itemByPages="100" />

        </>
    );
}