import Link             from 'next/link';
import { useRouter }    from 'next/router';
import { generateSlug } from '@lib/aquila-connector/product/helpersProduct';

export default function ProductCard({ product }) {
    const { query } = useRouter();
    
    const { slug, name, description, ati, img, canonical } = product;

    const currentSlug = generateSlug({
        categorySlugs: query.categorySlugs,
        slug,
        canonical
    });

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
                            <input type="number" min={1} className="w-commerce-commerceaddtocartquantityinput quantity" defaultValue={1} />
                            <input type="submit" value="Ajouter au panier" className="w-commerce-commerceaddtocartbutton order-button" />
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