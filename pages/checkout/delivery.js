import { useEffect, useState }                                                                  from 'react';
import { useRouter }                                                                            from 'next/router';
import useTranslation                                                                           from 'next-translate/useTranslation';
import Button                                                                                   from '@components/ui/Button';
import LightLayout                                                                              from '@components/layouts/LightLayout';
import NextSeoCustom                                                                            from '@components/tools/NextSeoCustom';
import { getShipmentCart, setCartShipment }                                                     from '@aquilacms/aquila-connector/api/cart';
import { useCart }                                                                              from '@lib/hooks';
import { setLangAxios, authProtectedPage, serverRedirect, moduleHook, formatDate, formatPrice } from '@lib/utils';
import { dispatcher }                                                                           from '@lib/redux/dispatcher';

export async function getServerSideProps({ locale, req, res }) {
    setLangAxios(locale, req, res);

    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/checkout/login?redirect=' + encodeURI(moduleHook('cart-validate-btn') ? '/checkout/clickandcollect' : '/checkout/address'));
    }
    if (moduleHook('cart-validate-btn')) {
        serverRedirect('/checkout/clickandcollect');
    }
    const pageProps = await dispatcher(locale, req, res);
    return pageProps;
}

export default function CheckoutDelivery() {
    const [shipments, setShipments]         = useState([]);
    const { cart, setCart }                 = useCart();
    const [deliveryValue, setDeliveryValue] = useState(0);
    const [total, setTotal]                 = useState(cart.priceTotal.ati);
    const [message, setMessage]             = useState();
    const [isLoading, setIsLoading]         = useState(false);
    const router                            = useRouter();
    const { lang, t }                       = useTranslation();
    
    useEffect(() => {
        // Check if the cart is empty
        if (!cart?.items?.length) {
            return router.push('/');
        }

        const fetchData = async () => {
            try {
                const res = await getShipmentCart({ _id: cart._id }, null, {}, lang);
                setShipments(res.datas);
                if (res.datas.length > 0) {
                    if (cart.delivery?.method && cart.delivery?.value?.ati) {
                        return setDeliveryValue(cart.delivery.value.ati);
                    }
                    const defaultPrice = res.datas[0].price;
                    setDeliveryValue(defaultPrice);
                    setTotal(cart.priceTotal.ati + res.datas[0].price);
                }
            } catch (err) {
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            }
        };
        fetchData();
    }, []);

    const calculateDelivery = (id) => {
        const ship = shipments.find((s) => s._id === id);
        setDeliveryValue(ship.price);
        if (cart.delivery?.method && cart.delivery?.value?.ati) {
            setTotal((cart.priceTotal.ati - cart.delivery.value.ati) + ship.price);
        } else {
            setTotal(cart.priceTotal.ati + ship.price);
        }
    };

    const onSubmitDelivery = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const shipmentId = e.currentTarget.shipment.value;
        const ship       = shipments.find((s) => s._id === shipmentId);

        try {
            // Set cart addresses
            const newCart = await setCartShipment(cart._id, ship, cart.addresses.delivery.isoCountryCode, false, lang);
            setCart(newCart);

            router.push('/checkout/payment');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    const previousStep = () => {
        router.back();
    };

    if (!cart?.items?.length) {
        return null;
    }
    
    return (
        <LightLayout>
            <NextSeoCustom
                noindex={true}
                title={t('pages/checkout:address.title')}
                description={t('pages/checkout:address.description')}
            />
            
            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">{t('pages/checkout:address.titleH1')}</h1>
                    </div>
                </div>
            </div>

            <div className="section-tunnel">
                <div className="container-tunnel">
                    <div className="container-step w-container">
                        <h2 className="heading-steps">3</h2>
                        <h2 className="heading-2-steps">{t('pages/checkout:delivery.step3')}</h2>
                    </div>
                    
                    <form className="form-mode-paiement-tunnel" onSubmit={onSubmitDelivery}>
                        <div className="columns-picker-paiement-tunnel delivery">
                            {
                                shipments.length ? shipments.map((ship, index) => (
                                    <div key={ship._id} className="column-center w-col w-col-12" style={{ justifyContent: 'unset', marginTop: '10px' }}>
                                        <label className="checkbox-click-collect w-radio">
                                            <input type="radio" name="shipment" value={ship._id} defaultChecked={ship._id === cart.delivery?.method || index === 0} onClick={(e) => calculateDelivery(e.target.value)} required style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                            <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                            <div className="labels">
                                                {
                                                    ship.url_logo ? (
                                                        <>
                                                            <img src={ship.url_logo} alt={ship.name} style={{ width: '100px' }} />
                                                            <span className="checkbox-label w-form-label">{ship.name}</span>
                                                        </>
                                                    ) : (
                                                        <span className="checkbox-label w-form-label">{ship.name}</span>
                                                    )
                                                    
                                                }
                                                <span>&nbsp;({formatDate(ship.dateDelivery, lang, { year: 'numeric', month: 'numeric', day: 'numeric' })})</span>
                                                <div className="price">{ship.price > 0 ? formatPrice(ship.price) : 'GRATUIT'}</div>
                                            </div>
                                        </label>
                                    </div>
                                )) : <p>Aucun mode de livraison !</p>
                            }
                        </div>

                        <div className="w-commerce-commercecartfooter" style={{ width: '100%' }}>
                            <div className="w-commerce-commercecartlineitem cart-line-item">
                                <div>{t('components/cart:cartListItem.delivery')}</div>
                                <div>{formatPrice(deliveryValue)}</div>
                            </div>
                            <div className="w-commerce-commercecartlineitem cart-line-item">
                                <div>{t('components/cart:cartListItem.total')}</div>
                                <div className="w-commerce-commercecartordervalue text-block">
                                    {formatPrice(total)}
                                </div>
                            </div>
                        </div>

                        <button type="button" className="log-button-03 w-button" onClick={previousStep}>{t('pages/checkout:delivery.previous')}</button>
                        &nbsp;
                        {
                            shipments.length > 0 && (
                                <Button 
                                    text={t('pages/checkout:delivery.next')}
                                    loadingText={t('pages/checkout:delivery.nextLoading')}
                                    isLoading={isLoading}
                                    className="log-button-03 w-button"
                                />
                            )
                        }
                        
                    </form>
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
            </div>
        </LightLayout>
    );
}