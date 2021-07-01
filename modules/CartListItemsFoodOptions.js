import { useEffect, useRef, useState } from 'react';
import Link                            from 'next/link';
import useTranslation                  from 'next-translate/useTranslation';
import BlockCMS                        from '@components/common/BlockCMS';
import CartItem                        from '@components/cart/CartItem';
import { getBlockCMS }                 from '@lib/aquila-connector/blockcms';
import { getImage }                    from '@lib/aquila-connector/product/helpersProduct';
import axios                           from '@lib/axios/AxiosInstance';
import { useCart }                     from '@lib/hooks';
import { formatPrice, unsetCookie }    from '@lib/utils';

function getFoodOptionsProducts(products) {
    let items = [];
    for (let j = 0; j < products.length; j++) {
        if (products[j].foodOptionFree) {
            let item = {
                ...products[j],
                quantity: products[j].quantity,
                price   : {
                    unit : { ati: 0, et: 0 },
                    total: { ati: 0 }
                }
            };
            if (products.find(i => i.code === products[j].code && !i.foodOptionFree)) {
                const itemPaid        = { ...products.find(i => i.code === products[j].code && !i.foodOptionFree) };
                item.quantity        += itemPaid.quantity;
                item.price.unit.ati  += itemPaid.price.unit.ati;
                item.price.unit.et   += itemPaid.price.unit.et;
                item.price.total.ati += itemPaid.price.total.ati;
            }
            items.push(item);
        }
    }
    items = items.sort((a, b) => a.weight - b.weight);
    return items;
}

// Get linked products
async function getLinkedProducts() {
    try {
        const res = await axios.get('v2/food-options/getLinks');
        return res.data;
    } catch (err) {
        console.error('foodOptions.getLinkedProducts');
        throw new Error(err?.response?.data?.message);
    }
}

// Update quantity of a complementary product from cart
async function updateQtyItem(cartId, itemId, itemIdProduct, quantity) {
    try {
        const res = await axios.put('v2/food-options/changeQty', {
            item: { _id: itemId, id: itemIdProduct, quantity },
            cartId
        });
        return res.data;
    } catch (err) {
        if (err?.response?.data?.status === 404) {
            unsetCookie('cart_id');
        }
        console.error('foodOptions.updateQtyItem');
        throw new Error(err?.response?.data?.message);
    }
}

export default function FoodOptions() {
    const [part, setPart]                           = useState(1);
    const [foodOptionsGroups, setFoodOptionsGroups] = useState([]);
    const [itemsFoodOptions, setItemsFoodOptions]   = useState([]);
    const [cmsBlockTop, setCmsBlockTop]             = useState('');
    const [message, setMessage]                     = useState();
    const timer                                     = useRef();
    const { cart, setCart }                         = useCart();
    const { t }                                     = useTranslation();

    // Get and format food options products
    useEffect(() => {
        let items = getFoodOptionsProducts(cart.items);
        setItemsFoodOptions([...items]);

        const itemsNoFood = cart.items?.filter((item) => !item.typeDisplay);

        const fetchData = async () => {
            try {
                // Get linked products
                const linkedProducts = await getLinkedProducts();
                
                for (let i in items) {
                    items[i] = items[i].id.code;
                }
                
                const groups = [];
                for (let group of linkedProducts.links) {
                    const codes = group.replace(/\s/g, '').split(',');

                    // Check if codes exists in cart
                    for (let i = 0; i < codes.length; i++) {
                        if (!items.includes(codes[i])) {
                            codes.splice(codes.indexOf(codes[i]), 1);
                        }
                    }
                    if (!codes.length) {
                        continue;
                    }

                    // Calculation of the number of products offered for each group 
                    let productsOffered = 0;
                    for (let i = 0; i < itemsNoFood.length; i++) {
                        for (let j = 0; j < codes.length; j++) {
                            const value      = itemsNoFood[i].id.attributes.find((a) => a.code === codes[j])?.value ? itemsNoFood[i].id.attributes.find((a) => a.code === codes[j]).value * itemsNoFood[i].quantity : 0;
                            productsOffered += value;
                        }
                    }
                    productsOffered = Math.ceil(productsOffered);

                    for (let code of codes) {
                        items.splice(items.indexOf(code), 1);
                    }
                    groups.push({ productsOffered, codes });
                }

                // Remaining products
                for (let item of items) {
                    groups.push({ codes: [item] });
                }
                setFoodOptionsGroups(groups);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        fetchData();

        return () => clearTimeout(timer.current);
    }, [cart]);

    // Get CMS block foodoption-info
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getBlockCMS('foodoption-info');
                setCmsBlockTop(data.content);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        fetchData();
    }, []);

    const onChangeQtyItem = async (e, item) => {
        let quantity = Number(e.target.value);
        if (quantity < 0) {
            quantity = 0;
        }
        
        // Update quantity
        try {
            const newCart = await updateQtyItem(cart._id, item._id, item.id._id, quantity);
            setCart(newCart);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            const st      = setTimeout(() => { setMessage(); }, 3000);
            timer.current = st;
        }
    };
    
    if (cart.items?.filter((item) => !item.typeDisplay).length > 0) {
        return (
            <form className="w-commerce-commercecartform">
                {
                    part === 1 ? (
                        <>
                            <div className="w-commerce-commercecartlist">
                                {cart.items?.filter((item) => !item.typeDisplay).map((item) => (
                                    <CartItem item={item} key={item._id} />
                                ))}
                            </div>

                            <div className="w-commerce-commercecartfooter">
                                <div>
                                    <button type="button" className="checkout-button-2 w-button" onClick={() => setPart(2)} style={{ width: '100%' }}>{t('modules/food-options-aquila:next')}</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-commerce-commercecartlist">
                                <BlockCMS content={cmsBlockTop} />
                                {
                                    cart.items?.filter((item) => item.foodOption).length > 0 && foodOptionsGroups.length > 0 ? foodOptionsGroups.map((group) => (
                                        <div key={group.codes.join('-')} style={group.codes.length > 1 ? { border: '2px dashed #ff8946', padding: '10px', marginTop: '15px', marginBottom: '15px' } : {}}>
                                            {group.productsOffered > 0 && group.codes.length > 1 && <span>{group.productsOffered} {group.productsOffered > 1 ? t('modules/food-options-aquila:productsOffered') : t('modules/food-options-aquila:productOffered')}</span>}
                                            {
                                                group.codes.length && group.codes.map((code) => {
                                                    const item = itemsFoodOptions.find((i) => i.code === code);
                                                    if (!item) {
                                                        return null;
                                                    }
                                                    const foundImg = item.id.images.find((img) => img.default);
                                                    return (
                                                        <div key={item._id} className="w-commerce-commercecartitem cart-item">
                                                            <img src={getImage(foundImg, '60x60') || '/images/no-image.svg'} alt="" className="w-commerce-commercecartitemimage" />
                                                            <div className="w-commerce-commercecartiteminfo div-block-4">
                                                                <div>
                                                                    <div className="w-commerce-commercecartproductname">{item.name}</div>
                                                                    <div>
                                                                        { item.price.total.ati ? formatPrice(item.price.total.ati) : (item.quantity > 0 ? t('modules/food-options-aquila:free') : null) }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <input type="number" className="w-commerce-commercecartquantity" value={item.quantity} onChange={(e) => onChangeQtyItem(e, item)} />
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    )) : (
                                        <p>{t('modules/food-options-aquila:noFoodOptions')}</p>
                                    )
                                }
                                <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'grey' }}>
                                    Supplément : {itemsFoodOptions?.length > 0 ? itemsFoodOptions.map((i) => i.price.total.ati).reduce((a, b) => a + b).toFixed(2) : 0} €
                                </div>
                                {
                                    message && (
                                        <div className={`w-commerce-commerce${message.type}`}>
                                            <div>
                                                {message.message}
                                            </div>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="w-commerce-commercecartfooter">
                                <div className="w-commerce-commercecartlineitem cart-line-item">
                                    <div>{t('components/cart:cartListItem.total')}</div>
                                    <div className="w-commerce-commercecartordervalue text-block">
                                        {cart.priceTotal.ati.toFixed(2)} €
                                    </div>
                                </div>
                                <div>
                                    <Link href="/checkout/clickandcollect">
                                        <a className="checkout-button-2 w-button">{t('components/cart:cartListItem.ordering')}</a>
                                    </Link>
                                    <button type="button" className="checkout-button-2 w-button" onClick={() => setPart(1)} style={{ width: '100%' }}>{t('modules/food-options-aquila:back')}</button>
                                </div>
                            </div>
                        </>
                    )
                }
            </form>
        );
    }

    return (
        <div className="w-commerce-commercecartemptystate empty-state">
            <div>{t('components/cart:cartListItem.empty')}</div>
            <div className="button-arrow-wrap">
                <Link href="/">
                    <a className="button w-button">{t('components/cart:cartListItem.goToHome')}</a>
                </Link>
            </div>
        </div>
    );
}