import axios           from '@lib/axios/AxiosInstance';
import { unsetCookie } from '@lib/utils';

const TMPlang = 'fr';

// Récupère un panier
export const getCart = async (cartId, cookiesServerInstance = undefined) => {
    const postBody = {
        'lang'    : TMPlang,
        'PostBody': {
            'populate': ['items.id']
        }
    };
    try {
        const response = await axios.post(`v2/cart/${cartId}`, postBody);
        return response.data;
    } catch(e) {
        console.error('cart.getCart');
        unsetCookie('cart_id', cookiesServerInstance);
        return {};
    }
};

// Ajoute un produit au panier
export const addToCart = async (cartId, product, qty, selections = undefined) => {
    try {
        const response = await axios.put('v2/cart/item', {
            cartId,
            item: {
                id      : product._id,
                quantity: qty,
                weight  : product.weight,
                selections
            }
        });
        return response.data;
    } catch(e) {
        console.error('cart.addToCart');
        return {};
    }
};

// Supprime un produit du panier
export const deleteItem = async (cartId, itemId) => {
    try {
        const res = await axios.delete(`v2/cart/${cartId}/item/${itemId}`);
        return res.data;
    } catch (err) {
        console.error('cart.deleteItem');
        unsetCookie('cart_id');
        return {};
    }
};

// Modifie la quantité d'un produit au panier
export const updateQtyItem = async (cartId, itemId, quantity) => {
    try {
        const res = await axios.put('v2/cart/updateQty', {
            item: { _id: itemId, quantity },
            cartId
        });
        return res.data;
    } catch (err) {
        console.error('cart.updateQtyItem');
        unsetCookie('cart_id');
        return {};
    }
};