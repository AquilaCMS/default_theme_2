import { useState, useEffect }      from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cookie                       from 'cookie';
import useTranslation               from 'next-translate/useTranslation';
import { getCart }                  from '@lib/aquila-connector/cart';
import { getPayments }              from '@lib/aquila-connector/payment';

// GET / SET cart data
export const useCart = () => {
    const [cart, setCart] = useState({});
    const { t }           = useTranslation();

    useEffect(() => {
        const cartId    = cookie.parse(document.cookie).cart_id;
        const fetchData = async () => {
            try {
                const data = await getCart(cartId);
                setCart(data);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        if (cartId) {
            fetchData();
        }
    }, []);

    return { cart, setCart };
};

// GET / SET cart ID
export const useCartId = () => {
    const [cartId, setCartId] = useState(null);

    useEffect(() => {
        setCartId(cookie.parse(document.cookie).cart_id);
    }, []);

    return { cartId, setCartId };
};

// GET category data from redux store
export const useCategory = () => {
    const category = useSelector((state) => state.category);
    return { category };
};


// GET category data products from redux store
export const useCategoryProducts = () => {
    const categoryProducts = useSelector((state) => state.categoryProducts);
    return { categoryProducts };
};

// GET CMS blocks data from redux store
export const useCmsBlocks = () => {
    const cmsBlocks = useSelector((state) => state.cmsBlocks);
    return { cmsBlocks };
};

// GET product data from redux store
export const useProduct = () => {
    const product = useSelector((state) => state.product);
    return { product };
};

// GET products data from redux store
export const useProducts = () => {
    const products = useSelector((state) => state.products);
    return { products };
};

// GET / SET show or hide bool for cart sidebar from redux store
export const useShowCartSidebar = () => {
    const showCartSidebar    = useSelector((state) => state.showCartSidebar);
    const dispatch           = useDispatch();
    const setShowCartSidebar = (bool) =>
        dispatch({
            type : 'SET_SHOW_CART_SIDEBAR',
            value: bool
        });
    return { showCartSidebar, setShowCartSidebar };
};

// GET static page data from redux store
export const useStaticPage = () => {
    const staticPage = useSelector((state) => state.staticPage);
    return { staticPage };
};

// GET payment methods
export const usePayments = () => {
    const [payments, setPayments] = useState([]);
    const { t }                   = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPayments();
                setPayments(data);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        fetchData();
    }, []);

    return payments;
};