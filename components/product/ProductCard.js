import { useEffect, useState } from 'react';
import cookie                  from 'cookie';
import Link                    from 'next/link';
import { useRouter }           from 'next/router';
import { generateSlug }        from '@lib/aquila-connector/product/helpersProduct';
import { addToCart }           from '@lib/aquila-connector/cart';
import { useShowCartSidebar }  from '@lib/hooks';

export default function ProductCard({ product }) {
    const [qty, setQty]          = useState(1);
    const [cartId, setCartId]    = useState();
    const { query }              = useRouter();
    const { setShowCartSidebar } = useShowCartSidebar();
    
    const { slug, name, description, ati, img, canonical } = product;

    const currentSlug = generateSlug({
        categorySlugs: query.categorySlugs,
        slug,
        canonical
    });

    useEffect(() => {
        setCartId(cookie.parse(document.cookie).cart_id);
    });

    const onChangeQty = (e) => {
        setQty(Number(e.target.value));
    };

    const onAddToCart = async (e) => {
        e.preventDefault();
        const newCart   = await addToCart(cartId, product, qty);
        document.cookie = 'cart_id=' + newCart._id + '; path=/;';
        document.cookie = 'count_cart=' + newCart.items.length + '; path=/;';
        setShowCartSidebar(true);
    };

    return (

        <div role="listitem" className="menu-item w-dyn-item w-col w-col-6">
            <div className="food-card">
                <Link href={currentSlug}>
                    <a className="food-image-square w-inline-block">
                        <img src={img || '/images/no-image.svg'} alt={name || 'Image produit'} style={{ 'width': '100%' }} className="food-image" loading="lazy" />
                    </a>
                </Link>
                <div className="food-card-content">
                    <Link href={currentSlug}>
                        <a className="food-title-wrap w-inline-block">
                            <h6 className="heading-9" >{name}</h6>
                            <div className="div-block-prix">
                                <div className="price">{ati.toFixed(2)} €</div>
                                <div className="price sale" />
                            </div>
                        </a>
                    </Link>
                    <p className="paragraph">{description}</p>
                    <div className="add-to-cart">
                        <form className="w-commerce-commerceaddtocartform default-state">
                            <input type="number" disabled={product.type !== 'simple'} className="w-commerce-commerceaddtocartquantityinput quantity" value={qty} onChange={onChangeQty} />
                            <button type="button" disabled={product.type !== 'simple'} className="w-commerce-commerceaddtocartbutton order-button" onClick={onAddToCart}>{product.type === 'simple' ? 'Ajouter au panier' : 'Composer'}</button>
                        </form>
                        {/* <div style={{ display: 'none' }} className="w-commerce-commerceaddtocartoutofstock out-of-stock-state">
                            <div>This product is out of stock.</div>
                        </div>
                        <div style={{ display: 'none' }} className="w-commerce-commerceaddtocarterror">
                            <div>
                                Product is not available in this quantity.
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>


    );
}