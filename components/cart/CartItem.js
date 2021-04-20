import { useState }                  from 'react';
import cookie                        from 'cookie';
import { deleteItem, updateQtyItem } from '@lib/aquila-connector/cart';
import { getImage }                  from '@lib/aquila-connector/product/helpersProduct';

export default function CartItem({ item, setCart }) {
    const [qty, setQty] = useState(item.quantity);
    const cartId        = cookie.parse(document.cookie).cart_id;

    const onChangeQtyItem = async (e) => {
        const quantity = Number(e.target.value);
        if (quantity < 1) {
            onDeleteItem();
        } else {
            setQty(quantity);
            const newCart   = await updateQtyItem(cartId, item._id, quantity);
            document.cookie = 'count_cart=' + newCart.items.length + '; path=/;';
            setCart(newCart);
        }
    };
    
    const onDeleteItem = async () => {
        const newCart   = await deleteItem(cartId, item._id);
        document.cookie = 'count_cart=' + newCart.items.length + '; path=/;';
        setCart(newCart);
    };

    const foundImg = item.id.images.find((img) => img.default);

    return (
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
    );

}