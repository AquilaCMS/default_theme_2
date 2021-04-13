export default function CartItem() {

    return (
        <div className="w-commerce-commercecartitem cart-item">
            <img src="/images/lidye-1Shk_PkNkNw-unsplash-p-500.jpeg" alt="Burger Waldo" className="w-commerce-commercecartitemimage" />
            <div className="w-commerce-commercecartiteminfo div-block-4">
                <div>
                    <div className="w-commerce-commercecartproductname">Burger Waldo</div>
                    <div>10,00 €</div>
                </div>

                <ul className="w-commerce-commercecartoptionlist">
                </ul>
                <a href="#" className="remove-button-cart w-inline-block">
                    <div className="text-block-2">X</div>
                </a>
            </div>
            <input type="number" required="" className="w-commerce-commercecartquantity" name="quantity" defaultValue="1" />
        </div>
    );

}