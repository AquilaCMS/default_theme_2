import menuProvider     from '@lib/aquila-connector/menu';
import siteProvider     from '@lib/aquila-connector/site';
import blockCMSProvider from '@lib/aquila-connector/blockcms';
import { getCart }      from '@lib/aquila-connector/cart';


// Set default actions, to be called in all pages via dispatcher
// Goal : No need to dispatch "global-datas" in every pages :)
export default function defaultActions() {
    return [
        {
            type: 'SET_NAVMENU',
            func: menuProvider.getMenu.bind(this, 'menu-header')
        }, {
            type: 'SET_FOOTER_MENU',
            func: menuProvider.getMenu.bind(this, 'menu-footer')
        }, {
            type: 'SET_SITECONFIG',
            func: siteProvider.getSiteInfo.bind(this)
        }, {
            type: 'PUSH_CMSBLOCKS',
            func: blockCMSProvider.getBlocksCMS.bind(this, ['top-banner'])
        }
        // todo user
    ];
}
