import { useEffect, useState } from 'react';
import useTranslation          from 'next-translate/useTranslation';
import { useProduct }          from '@lib/hooks';
import { cloneObj }            from '@lib/utils';

export default function ProductVariants() {
    const [currentIndex, setCurrentIndex] = useState();
    const { product, setProduct }         = useProduct();
    const { t }                           = useTranslation();

    useEffect(() => {
        
    }, []);

    const selectVariant = (variant) => {
        const p            = cloneObj(product);
        p.images           = variant.images;
        p.name             = variant.name;
        p.stock            = variant.stock;
        p.price            = variant.price;
        p.selected_variant = variant;
        setProduct(p);
    };

    if (product.variants[0].type === 'image') {
        return (
            <div className="product-variants-images">
                {
                    product.variants_values.filter((vv) => vv.active).map((variant) => {
                        const vImage = variant.images.find((img) => img.default) || {};
                        return (
                            <div key={variant._id} className="product-variant-image" onClick={() => selectVariant(variant)}>
                                <img src={`/images/productsVariant/50x50-50/${vImage._id}/${vImage.name}`} alt={variant.name} title={variant.name} />
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    return null;
}