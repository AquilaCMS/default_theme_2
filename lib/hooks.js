import { useState, useEffect }                           from 'react';
import { useSelector, useDispatch }                      from 'react-redux';
import { useRouter }                                     from 'next/router';
import cookie                                            from 'cookie';
import useTranslation                                    from 'next-translate/useTranslation';
import { getOrders, getOrderById }                       from '@lib/aquila-connector/order';
import { getPayments }                                   from '@lib/aquila-connector/payment';
import { getUser }                                       from '@lib/aquila-connector/user';
import { getUrlWithLang, getUserIdFromJwt, unsetCookie } from '@lib/utils';

/**
 * GET / SET cart data
 * @returns { cart: {}, setCart: function }
 */
export const useCart = () => {
    const cart     = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const setCart  = (cart) =>
        dispatch({
            type: 'SET_CART',
            data: cart
        });

    return { cart, setCart };
};

// GET category data from redux store
export const useCategory = () => {
    const category = useSelector((state) => state.category);
    return category;
};


// GET category data products from redux store
export const useCategoryProducts = () => {
    const categoryProducts = useSelector((state) => state.categoryProducts);
    return categoryProducts;
};

// GET CMS blocks data from redux store
export const useCmsBlocks = () => {
    const cmsBlocks = useSelector((state) => state.cmsBlocks);
    return cmsBlocks;
};

// GET product data from redux store
export const useProduct = () => {
    const product = useSelector((state) => state.product);
    return product;
};

// GET products data from redux store
export const useProducts = () => {
    const products = useSelector((state) => state.products);
    return products;
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

// GET site infos
export const useSiteConfig = () => {
    const siteConfig = useSelector((state) => state.siteConfig);
    return siteConfig;
};

// GET static page data from redux store
export const useStaticPage = () => {
    const staticPage = useSelector((state) => state.staticPage);
    return staticPage;
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

// GET user from JWT
export const useUser = () => {
    const [user, setUser] = useState();
    const { t }           = useTranslation();

    useEffect(() => {
        const idUser    = getUserIdFromJwt(document.cookie);
        const fetchData = async () => {
            try {
                const data = await getUser(idUser);
                setUser(data);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        if (idUser) {
            fetchData();
        }
    }, []);

    return user;
};

// GET orders
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const { t }               = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getOrders();
                setOrders(data.datas);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        fetchData();
    }, []);

    return orders;
};

// GET order from ID
export const useOrder = () => {
    const [order, setOrder] = useState();
    const { langs }         = useSiteConfig();
    const router            = useRouter();
    const { lang, t }       = useTranslation();

    useEffect(() => {
        const orderId   = cookie.parse(document.cookie).order_id;
        const fetchData = async () => {
            try {
                const data = await getOrderById(orderId);
                setOrder(data);
                unsetCookie('order_id');
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        if (orderId) {
            fetchData();
        } else {
            router.push(getUrlWithLang('/', lang, langs));
        }
    }, []);

    return order;
};