import { getMenu }      from 'aquila-connector/api/menu';
import { getSiteInfo }  from 'aquila-connector/api/site';
import { getBlocksCMS } from 'aquila-connector/api/blockcms';
import { getCart }      from 'aquila-connector/api/cart';


// Set default actions, to be called in all pages via dispatcher
// Goal : No need to dispatch "global-datas" in every pages :)
export default function defaultActions(cookiesServerInstance) {
    const array = [
        {
            type: 'SET_NAVMENU',
            func: getMenu.bind(this, 'menu-header')
        }, {
            type: 'SET_FOOTER_MENU',
            func: getMenu.bind(this, 'menu-footer')
        }, {
            type: 'SET_SITECONFIG',
            func: getSiteInfo.bind(this)
        }, {
            type: 'PUSH_CMSBLOCKS',
            func: getBlocksCMS.bind(this, ['top-banner'])
        }
    ];

    if (cookiesServerInstance) {
        const cartId = cookiesServerInstance.get('cart_id');
        if (cartId) {
            array.push({
                type: 'SET_CART',
                func: getCart.bind(this, cartId, cookiesServerInstance)
            });
        }
    }
    return array;
}
