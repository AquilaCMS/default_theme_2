import { useState, useEffect }      from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useTranslation               from 'next-translate/useTranslation';
import { getPaymentMethods }        from 'aquila-connector/api/payment';
import { getUser }                  from 'aquila-connector/api/user';
import { getUserIdFromJwt }         from '@lib/utils';

/**
 * GET / SET cart data (redux)
 * @returns { cart: {}, setCart: function }
 */
export const useCart = () => {
    const cart     = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const setCart  = (data) =>
        dispatch({
            type: 'SET_CART',
            data
        });

    return { cart, setCart };
};

// GET category data (redux)
export const useCategory = () => {
    const category = useSelector((state) => state.category);
    return category;
};

// GET category page (redux)
export const useCategoryPage = () => {
    const categoryPage    = useSelector((state) => state.categoryPage);
    const dispatch        = useDispatch();
    const setCategoryPage = (data) =>
        dispatch({
            type: 'SET_CATEGORY_PAGE',
            data
        });

    return { categoryPage, setCategoryPage };
};

// GET / SET category data products (redux)
export const useCategoryProducts = () => {
    const categoryProducts    = useSelector((state) => state.categoryProducts);
    const dispatch            = useDispatch();
    const setCategoryProducts = (data) =>
        dispatch({
            type: 'SET_CATEGORY_PRODUCTS',
            data
        });
    return { categoryProducts, setCategoryProducts };
};

// GET CMS blocks data (redux)
export const useCmsBlocks = () => {
    const cmsBlocks = useSelector((state) => state.cmsBlocks);
    return cmsBlocks;
};

// GET component data (redux)
export const useComponentData = () => {
    const componentData = useSelector((state) => state.componentData);
    return componentData;
};

// GET menu data (redux)
export const useNavMenu = () => {
    const navMenu = useSelector((state) => state.navMenu);
    return navMenu;
};

// GET footer menu data (redux)
export const useFooterMenu = () => {
    const footerMenu = useSelector((state) => state.footerMenu);
    return footerMenu;
};

// GET product data (redux)
export const useProduct = () => {
    const product = useSelector((state) => state.product);
    return product;
};

// GET products data (redux)
export const useProducts = () => {
    const products = useSelector((state) => state.products);
    return products;
};

// GET / SET show or hide bool for cart sidebar (redux)
export const useShowCartSidebar = () => {
    const showCartSidebar    = useSelector((state) => state.showCartSidebar);
    const dispatch           = useDispatch();
    const setShowCartSidebar = (value) =>
        dispatch({
            type: 'SET_SHOW_CART_SIDEBAR',
            value
        });
    return { showCartSidebar, setShowCartSidebar };
};

// GET site infos (redux)
export const useSiteConfig = () => {
    const siteConfig = useSelector((state) => state.siteConfig);
    return siteConfig;
};

// GET static page data (redux)
export const useStaticPage = () => {
    const staticPage = useSelector((state) => state.staticPage);
    return staticPage;
};

// GET payment methods
export const usePaymentMethods = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const { t }                               = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPaymentMethods();
                setPaymentMethods(data);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        fetchData();
    }, []);

    return paymentMethods;
};

// GET orders (redux)
export const useOrders = () => {
    const orders    = useSelector((state) => state.orders);
    const dispatch  = useDispatch();
    const setOrders = (data) =>
        dispatch({
            type: 'SET_ORDERS',
            data
        });
    return { orders, setOrders };
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