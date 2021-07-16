import { useEffect, useRef, useState } from 'react';
import useTranslation                  from 'next-translate/useTranslation';
import { deleteItem, updateQtyItem }   from 'aquila-connector/api/cart';
import { getImage }                    from 'aquila-connector/api/product/helpersProduct';
import { useCart }                     from '@lib/hooks';
import { formatPrice }                 from '@lib/utils';

export default function CartItem({ item }) {
    const [qty, setQty]         = useState(item.quantity);
    const [message, setMessage] = useState();
    const timer                 = useRef();
    const { cart, setCart }     = useCart();
    const { t }                 = useTranslation();

    useEffect(() => {
        return () => clearTimeout(timer.current);
    }, []);

    const onChangeQtyItem = async (e) => {
        if (!e.target.value) {
            return setQty('');
        }
        const quantity = Number(e.target.value);
        if (quantity < 1) {
            onDeleteItem();
        } else {
            try {
                const newCart = await updateQtyItem(cart._id, item._id, quantity);
                setQty(quantity);
                setCart(newCart);
            } catch (err) {
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
                const st      = setTimeout(() => { setMessage(); }, 3000);
                timer.current = st;
            }
        }
    };
    
    const onDeleteItem = async () => {
        try {
            const newCart = await deleteItem(cart._id, item._id);
            setCart(newCart);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            const st      = setTimeout(() => { setMessage(); }, 3000);
            timer.current = st;
        }
    };

    const foundImg = item.id.images.find((img) => img.default);

    return (
        <>
            <div className="w-commerce-commercecartitem cart-item">
                <img src={getImage(foundImg, '60x60') || '/images/no-image.svg'} alt="" className="w-commerce-commercecartitemimage" />
                <div className="w-commerce-commercecartiteminfo div-block-4">
                    <div>
                        <div className="w-commerce-commercecartproductname">{item.name}</div>
                        <div>
                            { item.price?.special ? <><del>{formatPrice(item.price.unit.ati)}</del>&nbsp;</> : null }
                            { item.price?.special ? formatPrice(item.price.special.ati) : formatPrice(item.price.unit.ati) }
                        </div>
                    </div>
                    {
                        item.selections && item.selections.length > 0 && (
                            <ul className="w-commerce-commercecartoptionlist">
                                {
                                    item.selections.map((section) => (
                                        section.products.map((itemSection) => {
                                            const diffPrice = item.id.bundle_sections?.find((bundle_section) => bundle_section.ref === section.bundle_section_ref)?.products?.find((product) => product.id === itemSection._id)?.modifier_price?.ati;
                                            return (
                                                <li key={itemSection._id}>{itemSection.name}{diffPrice && diffPrice !== 0 ? <> ({diffPrice > 0 ? '+' : ''}{formatPrice(diffPrice)})</> : null}</li>
                                            );
                                        })
                                    ))
                                }
                            </ul>
                        )
                    }
                    <button type="button" className="remove-button-cart w-inline-block" onClick={onDeleteItem}>
                        <div className="text-block-2">X</div>
                    </button>
                </div>
                <input type="number" className="w-commerce-commercecartquantity" value={qty} onChange={onChangeQtyItem} />
            </div>
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