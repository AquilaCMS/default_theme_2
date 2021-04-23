import axios           from '@lib/axios/AxiosInstance';
import { unsetCookie } from '@lib/utils';

const TMPlang = 'fr';

// Récupère un panier
export const getCart = async (cartId) => {
    const postBody = {
        'lang'    : TMPlang,
        'PostBody': {
            'populate': ['items.id']
        }
    };
    try {
        const response = await axios.post(`v2/cart/${cartId}`, postBody);
        return response.data;
    } catch(err) {
        console.error('cart.getCart');
        unsetCookie(['cart_id', 'count_cart']);
        throw new Error(err?.response?.data?.message);
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
    } catch(err) {
        console.error('cart.addToCart');
        unsetCookie(['cart_id', 'count_cart']);
        throw new Error(err?.response?.data?.message);
    }
};

// Supprime un produit du panier
export const deleteItem = async (cartId, itemId) => {
    try {
        const res = await axios.delete(`v2/cart/${cartId}/item/${itemId}`);
        return res.data;
    } catch (err) {
        console.error('cart.deleteItem');
        unsetCookie(['cart_id', 'count_cart']);
        throw new Error(err?.response?.data?.message);
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
        unsetCookie(['cart_id', 'count_cart']);
        throw new Error(err?.response?.data?.message);
    }
};

// Transforme un panier en commande
export const cartToOrder = async (cartId) => {
    try {
        const res = await axios.put('v2/cart/to/order', {
            cartId,
            lang: TMPlang
        });
        return res.data.data;
    } catch (err) {
        console.error('cart.cartToOrder');
        throw new Error(err?.response?.data?.message);
    }
};