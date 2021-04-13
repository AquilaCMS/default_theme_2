import { useSelector, useDispatch } from 'react-redux';

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

export const useCategory = () => {
    const category = useSelector((state) => state.category);
    return { category };
};

export const useCategoryProducts = () => {
    const categoryProducts = useSelector((state) => state.categoryProducts);
    return { categoryProducts };
};

export const useCmsBlocks = () => {
    const cmsBlocks = useSelector((state) => state.cmsBlocks);
    return { cmsBlocks };
};

export const useProduct = () => {
    const product = useSelector((state) => state.product);
    return { product };
};

export const useProducts = () => {
    const products = useSelector((state) => state.products);
    return { products };
};

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

export const useStaticPage = () => {
    const staticPage = useSelector((state) => state.staticPage);
    return { staticPage };
};