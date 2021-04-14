import { useSelector, useDispatch } from 'react-redux';

// GET / SET cart data from redux store
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