import { useEffect, useRef, useState } from 'react';
import Link                            from 'next/link';
import useTranslation                  from 'next-translate/useTranslation';
import BlockCMS                        from '@components/common/BlockCMS';
import CartDiscount                    from '@components/cart/CartDiscount';
import CartItem                        from '@components/cart/CartItem';
import Button                          from '@components/ui/Button';
import { getBlockCMS }                 from '@aquilacms/aquila-connector/api/blockcms';
import { deleteCartShipment }          from '@aquilacms/aquila-connector/api/cart';
import { getImage }                    from '@aquilacms/aquila-connector/api/product/helpersProduct';
import axios                           from '@aquilacms/aquila-connector/lib/AxiosInstance';
import { useCart }                     from '@lib/hooks';
import { formatPrice, unsetCookie }    from '@lib/utils';

function getFoodOptionsProducts(products) {
    let items = [];
    if (products) {
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
    }
    
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

export default function CartListItemsFoodOptions() {
    const [part, setPart]                           = useState(1);
    const [foodOptionsGroups, setFoodOptionsGroups] = useState([]);
    const [itemsFoodOptions, setItemsFoodOptions]   = useState([]);
    const [cmsBlockTop, setCmsBlockTop]             = useState('');
    const [message, setMessage]                     = useState();
    const [isLoading, setIsLoading]                 = useState(false);
    const timer                                     = useRef();
    const { cart, setCart }                         = useCart();
    const { lang, t }                               = useTranslation();

    // Get food options products
    useEffect(() => {
        const items = getFoodOptionsProducts(cart.items);
        setItemsFoodOptions([...items]);

        return () => clearTimeout(timer.current);
    }, [cart]);

    // Get CMS block foodoption-info
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getBlockCMS('foodoption-info', lang);
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
        
        try {
            // Update quantity
            let newCart = await updateQtyItem(cart._id, item._id, item.id._id ? item.id._id : item.id, quantity);

            // Deletion of the cart delivery
            if (newCart.delivery?.method) {
                newCart = await deleteCartShipment(newCart._id);
            }

            setCart(newCart);
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            const st      = setTimeout(() => { setMessage(); }, 3000);
            timer.current = st;
        }
    };

    const onChangePart = async (part) => {
        setIsLoading(true);
        
        if (part === 2) {
            // Get and format food options products
            let items = getFoodOptionsProducts(cart.items);

            try {
                // Get linked products
                const linkedProducts = await getLinkedProducts();
                
                for (let i in items) {
                    items[i] = items[i].code;
                }
                
                const groups = [];
                for (let group of linkedProducts) {
                    const name  = group.name;
                    const codes = group.link.replace(/\s/g, '').split(',');

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
                    const itemsNoFood   = cart.items?.filter((item) => !item.typeDisplay);
                    let productsOffered = 0;
                    for (let i = 0; i < itemsNoFood.length; i++) {
                        for (let j = 0; j < codes.length; j++) {
                            const value      = itemsNoFood[i].attributes.find((a) => a.code === codes[j])?.value ? itemsNoFood[i].attributes.find((a) => a.code === codes[j]).value * itemsNoFood[i].quantity : 0;
                            productsOffered += value;
                        }
                    }
                    productsOffered = Math.ceil(productsOffered);

                    for (let code of codes) {
                        items.splice(items.indexOf(code), 1);
                    }
                    groups.push({ name, productsOffered, codes });
                }

                // Remaining products
                for (let item of items) {
                    groups.push({ codes: [item] });
                }
                setFoodOptionsGroups(groups);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        }
        
        setPart(part);
        setIsLoading(false);
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
                            
                            <CartDiscount />

                            <div className="w-commerce-commercecartfooter">
                                <div className="w-commerce-commercecartlineitem cart-line-item">
                                    <div>{t('components/cart:cartListItem.subTotal')}</div>
                                    <div>{formatPrice(cart.priceSubTotal.ati)}</div>
                                </div>
                                {
                                    cart.delivery?.method && cart.delivery?.value && (
                                        <div className="w-commerce-commercecartlineitem cart-line-item">
                                            <div>{t('components/cart:cartListItem.delivery')}</div>
                                            <div>{formatPrice(cart.delivery.value.ati)}</div>
                                        </div>
                                    )
                                }
                                {
                                    cart.promos[0] && (
                                        <div className="w-commerce-commercecartlineitem cart-line-item">
                                            <div>{t('components/cart:cartListItem.discount')}</div>
                                            <div>- {formatPrice(cart.promos[0].discountATI)}</div>
                                        </div>
                                    )
                                }
                                <div className="w-commerce-commercecartlineitem cart-line-item">
                                    <div>{t('components/cart:cartListItem.total')}</div>
                                    <div className="w-commerce-commercecartordervalue text-block">
                                        {formatPrice(cart.priceTotal.ati)}
                                    </div>
                                </div>
                                <div>
                                    {
                                        itemsFoodOptions.length > 0 ? (
                                            <Button
                                                type="button"
                                                text={t('modules/food-options-aquila:next')}
                                                loadingText={t('modules/food-options-aquila:nextLoading')}
                                                isLoading={isLoading}
                                                className="checkout-button-2 w-button"
                                                hookOnClick={() => onChangePart(2)}
                                                style={{ width: '100%' }}
                                            />
                                        ) : (
                                            <Link href="/checkout/address" className="checkout-button-2 w-button">
                                                {t('components/cart:cartListItem.ordering')}
                                            </Link>
                                        )
                                    }
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
                                            {group.productsOffered > 0 && group.codes.length > 1 && <span>{group.name} | {group.productsOffered} {group.productsOffered > 1 ? t('modules/food-options-aquila:productsOffered') : t('modules/food-options-aquila:productOffered')}</span>}
                                            {
                                                group.codes.length && group.codes.map((code) => {
                                                    const item = itemsFoodOptions.find((i) => i.code === code);
                                                    if (!item) {
                                                        return null;
                                                    }
                                                    return (
                                                        <div key={item._id} className="w-commerce-commercecartitem cart-item">
                                                            <img src={getImage({ _id: item.image, title: item.code, extension: '.png', alt: item.code }, '60x60').url || '/images/no-image.svg'} alt={item.code} className="w-commerce-commercecartitemimage" />
                                                            <div className="w-commerce-commercecartiteminfo div-block-4">
                                                                <div>
                                                                    <div className="w-commerce-commercecartproductname">{item.name}</div>
                                                                    <div>
                                                                        { item.price.total.ati ? formatPrice(item.price.total.ati) : (item.quantity > 0 ? t('modules/food-options-aquila:free') : null) }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <input type="number" className="w-commerce-commercecartquantity" value={item.quantity} onChange={(e) => onChangeQtyItem(e, item)} onWheel={(e) => e.target.blur()} />
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
                                    Supplément : {itemsFoodOptions?.length > 0 ? formatPrice(itemsFoodOptions.map((i) => i.price.total.ati).reduce((a, b) => a + b)) : '0 €'}
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
                                    <div>{t('components/cart:cartListItem.subTotal')}</div>
                                    <div>{formatPrice(cart.priceSubTotal.ati)}</div>
                                </div>
                                {
                                    cart.delivery?.method && cart.delivery?.value && (
                                        <div className="w-commerce-commercecartlineitem cart-line-item">
                                            <div>{t('components/cart:cartListItem.delivery')}</div>
                                            <div>{formatPrice(cart.delivery.value.ati)}</div>
                                        </div>
                                    )
                                }
                                {
                                    cart.promos[0] && (
                                        <div className="w-commerce-commercecartlineitem cart-line-item">
                                            <div>{t('components/cart:cartListItem.discount')}</div>
                                            <div>- {formatPrice(cart.promos[0].discountATI)}</div>
                                        </div>
                                    )
                                }
                                <div className="w-commerce-commercecartlineitem cart-line-item">
                                    <div>{t('components/cart:cartListItem.total')}</div>
                                    <div className="w-commerce-commercecartordervalue text-block">
                                        {formatPrice(cart.priceTotal.ati)}
                                    </div>
                                </div>
                                <div>
                                    <Link href="/checkout/address" className="checkout-button-2 w-button">
                                        {t('components/cart:cartListItem.ordering')}
                                    </Link>
                                    <button type="button" className="checkout-button-2 w-button" onClick={() => onChangePart(1)} style={{ width: '100%' }}>{t('modules/food-options-aquila:back')}</button>
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
                <Link href="/" className="button w-button">
                    {t('components/cart:cartListItem.goToHome')}
                </Link>
            </div>
        </div>
    );
}