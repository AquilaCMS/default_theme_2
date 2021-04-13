import React, { useState } from 'react';
import CartSidebarView     from '@components/cart/CartSidebarView';
import NavMenu             from '@components/navigation/NavMenu';

export default function Header() {
    const siteName = 'TODO';

    const [toggleCart, setToggleCart] = useState(false);
    const handleCart                  = () => {
        setToggleCart(!toggleCart);
    };

    const closeCart = () => {
        setToggleCart(false);
    };

    return (
        <div id="Navigation" data-collapse="medium" role="banner" className="navbar w-nav">
            <div className="div-block-lang">
                <a href="#" className="link-lang">FR</a>
                &nbsp;/&nbsp;
                <a href="#" className="link-lang">EN</a>
            </div>
            <div className="navigation-container">
                <div className="navigation-left">
                    <a href="/" aria-current="page" className="brand w-nav-brand w--current">
                        <img src="/images/monrestaurant-logo.jpg" alt={siteName} />
                    </a>
                </div>
                <div className="navigation-right">
                    
                    <NavMenu />

                    <div className="w-commerce-commercecartwrapper">
                        <a href="#" className="w-commerce-commercecartopenlink cart-button w-inline-block" onClick={handleCart}>
                            <svg className="w-commerce-commercecartopenlinkicon cart-icon" width="17px" height="17px" viewBox="0 0 17 17">
                                <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                                    <path d="M2.60592789,2 L0,2 L0,0 L4.39407211,0 L4.84288393,4 L16,4 L16,9.93844589 L3.76940945,12.3694378 L2.60592789,2 Z M15.5,17 C14.6715729,17 14,16.3284271 14,15.5 C14,14.6715729 14.6715729,14 15.5,14 C16.3284271,14 17,14.6715729 17,15.5 C17,16.3284271 16.3284271,17 15.5,17 Z M5.5,17 C4.67157288,17 4,16.3284271 4,15.5 C4,14.6715729 4.67157288,14 5.5,14 C6.32842712,14 7,14.6715729 7,15.5 C7,16.3284271 6.32842712,17 5.5,17 Z" fill="currentColor" fillRule="nonzero" />
                                </g>
                            </svg>
                            <div className="w-commerce-commercecartopenlinkcount cart-quantity">0</div>
                        </a>

                        <CartSidebarView toggleCart={toggleCart} closeCart={closeCart} />

                    </div>

                </div>
            </div>
        </div>

    );
}
