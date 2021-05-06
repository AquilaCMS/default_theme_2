import { useEffect, useState }       from 'react';
import useTranslation                from 'next-translate/useTranslation';
import { deleteItem, updateQtyItem } from '@lib/aquila-connector/cart';
import { getImage }                  from '@lib/aquila-connector/product/helpersProduct';
import { useCart }                   from '@lib/hooks';

export default function CartItem({ item }) {
    const [qty, setQty]         = useState(item.quantity);
    const [message, setMessage] = useState();
    const [timer, setTimer]     = useState();
    const { cart, setCart }     = useCart();
    const { t }                 = useTranslation();

    useEffect(() => {
        return () => clearTimeout(timer);
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
                const t = setTimeout(() => { setMessage(); }, 3000);
                setTimer(t);
            }
        }
    };
    
    const onDeleteItem = async () => {
        try {
            const newCart = await deleteItem(cart._id, item._id);
            setCart(newCart);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            const t = setTimeout(() => { setMessage(); }, 3000);
            setTimer(t);
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
                            { item.price?.special ? <><del>{item.price.unit.ati.toFixed(2)} €</del>&nbsp;</> : null }
                            { item.price?.special ? item.price.special.ati.toFixed(2) : item.price.unit.ati.toFixed(2) } €
                        </div>
                    </div>

                    <ul className="w-commerce-commercecartoptionlist"></ul>
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