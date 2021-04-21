import useTranslation from 'next-translate/useTranslation';
import CartListItems  from '@components/cart/CartListItems';

export default function CartSidebarView({ hideCartSidebar }) {
    // TODO : essayer de faire l'animation :
    // - opacité 0 => 1 sur le masque (1er div)
    // - tranlation de droite à gauche de la sidebar (2ème div)

    const { t } = useTranslation();

    return (

        <div className="w-commerce-commercecartcontainerwrapper w-commerce-commercecartcontainerwrapper--cartType-rightSidebar">
            <div className="w-commerce-commerceoutcartcontainer" onClick={hideCartSidebar} />
            <div className="w-commerce-commercecartcontainer">
                <div className="w-commerce-commercecartheader">
                    <div className="text-panier">{t('components/cart:cartSideBarView.title')}</div>
                    <button className="w-commerce-commercecartcloselink w-inline-block" style={{ 'backgroundColor': 'transparent' }} onClick={hideCartSidebar}>
                        <svg width="16px" height="16px" viewBox="0 0 16 16">
                            <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" fill="#333333">
                                    <polygon points="6.23223305 8 0.616116524 13.6161165 2.38388348 15.3838835 8 9.76776695 13.6161165 15.3838835 15.3838835 13.6161165 9.76776695 8 15.3838835 2.38388348 13.6161165 0.616116524 8 6.23223305 2.38388348 0.616116524 0.616116524 2.38388348 6.23223305 8"></polygon>
                                </g>
                            </g>
                        </svg>
                    </button>
                </div>
                <div className="w-commerce-commercecartformwrapper">
                    <CartListItems />
                </div>
            </div>
        </div>

    );
}