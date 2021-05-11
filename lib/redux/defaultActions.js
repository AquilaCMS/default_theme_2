import { getMenu }      from '@lib/aquila-connector/menu';
import { getSiteInfo }  from '@lib/aquila-connector/site';
import { getBlocksCMS } from '@lib/aquila-connector/blockcms';
import { getCart }      from '@lib/aquila-connector/cart';


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
        // todo user
    ];

    if (cookiesServerInstance) {
        const cartId = cookiesServerInstance.get('cart_id');
        if (cartId) {
            array.push({
                type: 'SET_CART',
                func: getCart.bind(this, cartId, cookiesServerInstance)
            });
            console.log(array);
        }
    }
    return array;
}
