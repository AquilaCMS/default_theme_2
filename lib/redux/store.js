import { useMemo }                            from 'react';
import { createStore/* , applyMiddleware */ } from 'redux';
// import { composeWithDevTools } from 'redux-devtools-extension'

let store;

const initialState = {
    // Common
    siteConfig      : {},
    // Products
    products        : { datas: [], count: 0 },
    product         : null,
    categoryProducts: { datas: [], count: 0 },
    // Categories
    category        : {},
    categoryPage    : 1,
    // Statics
    staticPage      : {},
    // BlockCMS
    cmsBlocks       : [],
    // Navigation
    navMenu         : {},
    footerMenu      : {},
    // Cart
    cart            : {},
    showCartSidebar : false,
    componentData   : {},
};

// TODO : https://openclassrooms.com/fr/courses/5511091-organisez-votre-application-avec-la-logique-redux/5880761-appelez-les-actions-dans-les-reducers
const reducer = (state = initialState, action) => {
    switch (action.type) {
    // Common
    case 'SET_SITECONFIG':
        return {
            ...state,
            siteConfig: action.data || initialState.siteConfig
        };
    // Products
    case 'SET_CATEGORY_PRODUCTS':
        return {
            ...state,
            categoryProducts: action.data || initialState.categoryProducts
        };
    case 'SET_PRODUCT':
        return {
            ...state,
            product: action.data || initialState.product
        };
    case 'SET_PRODUCTS':
        return {
            ...state,
            products: action.data || initialState.products
        };
    // Categories
    case 'SET_CATEGORY':
        return {
            ...state,
            category: action.data && action.data.datas && action.data.datas.length > 0 ? action.data.datas[0] : initialState.category
        };
    case 'SET_CATEGORY_PAGE':
        return {
            ...state,
            categoryPage: action.data || initialState.categoryPage
        };
    // Statics
    case 'SET_STATICPAGE':
        return {
            ...state,
            staticPage: action.data || initialState.staticPage
        };
    // BlockCMS
    case 'PUSH_CMSBLOCKS':
        return {
            ...state,
            cmsBlocks: state.cmsBlocks.concat(action.data)// passer une array en data
        };
    // Navigation
    case 'SET_NAVMENU':
        return {
            ...state,
            navMenu: action.data || initialState.navMenu
        };
    case 'SET_FOOTER_MENU':
        return {
            ...state,
            footerMenu: action.data || initialState.footerMenu
        };
    // Cart
    case 'SET_CART':
        return {
            ...state,
            cart: action.data || initialState.cart
        };
    case 'SET_SHOW_CART_SIDEBAR':
        return {
            ...state,
            showCartSidebar: action.value || initialState.showCartSidebar
        };
    case 'SET_COMPONENT_DATA':
        return {
            ...state,
            componentData: { ...state.componentData, ...action.data }
        };
    // Default
    default:
        return state;
    }
};

function initStore(preloadedState = initialState) {
    return createStore(
        reducer,
        preloadedState/* ,
        composeWithDevTools(applyMiddleware()) */
    );
}

export const initializeStore = (preloadedState) => {
    let _store = store ?? initStore(preloadedState);

    // After navigating to a page with an initial Redux state, merge that state
    // with the current state in the store, and create a new store
    if (preloadedState && store) {
        _store = initStore({
            ...store.getState(),
            ...preloadedState,
        });
        // Reset the current store
        store = undefined;
    }

    // For SSG and SSR always create a new store
    if (typeof window === 'undefined') return _store;
    // Create the store once in the client
    if (!store) store = _store;

    return _store;
};

export function useStore(initialState) {
    const store = useMemo(() => initializeStore(initialState), [initialState]);
    return store;
}
