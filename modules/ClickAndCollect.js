import { useEffect, useState }        from 'react';
import Head                           from 'next/head';
import Geosuggest                     from 'react-geosuggest';
import useTranslation                 from 'next-translate/useTranslation';
import moment                         from 'moment';
import DatePicker, { registerLocale } from 'react-datepicker';
import fr                             from 'date-fns/locale/fr';
import Button                         from '@components/ui/Button';
import { setCartAddresses }           from '@lib/aquila-connector/cart';
import { getUser }                    from '@lib/aquila-connector/user';
import axios                          from '@lib/axios/AxiosInstance';
import { useCart }                    from '@lib/hooks';
import { getUserIdFromJwt }           from '@lib/utils';

import 'react-datepicker/dist/react-datepicker.css';

registerLocale('fr', fr);

function getArraySchedules(currentPOS, date) {
    const nowTimestamp = Math.trunc(Date.now() / 1000);
    const selDate      = new Date(date);
    const selDay       = selDate.getDay() === 0 ? 6 : selDate.getDay() - 1;
    const timeLine     = currentPOS.deliveryAvailability[selDay]; // Horaires du jour sélectionné
    const step         = currentPOS.timeSlot ? Number(currentPOS.timeSlot) : 30; // Créneau horaire (en minutes)
    const prepareDelay = currentPOS.prepareDelay ? Number(currentPOS.prepareDelay) : 45;

    const array = [];
    if (timeLine) {
        const year  = selDate.getFullYear(); // Année de la date sélectionnée
        const month = selDate.getMonth(); // Mois de la date sélectionnée
        const day   = selDate.getDate(); // Jour de la date sélectionnée

        // On détermine le nombre de commandes par horaire du jour sélectionné
        const orders = {};
        if (currentPOS.orders && currentPOS.orders.length) {
            for (let i = 0; i < currentPOS.orders.length; i++) {
                const order      = currentPOS.orders[i];
                const date_order = new Date(order.date);
                if (`${year}-${month}-${day}` === `${date_order.getFullYear()}-${date_order.getMonth()}-${date_order.getDate()}`) {
                    const hour    = (`0${date_order.getHours()}`).substr(-2);
                    const minute  = (`0${date_order.getMinutes()}`).substr(-2);
                    const index   = `${hour}h${minute}`;
                    orders[index] = orders[index] ? orders[index] + 1 : 1;
                }
            }
        }

        // On boucle sur les 2 créneaux
        for (let i = 1; i <= 2; i++) {
            const min = timeLine[`minHour${i}`];
            const max = timeLine[`maxHour${i}`];
            if (min && max) {
                const [minHour, minMinute] = min.split('h');
                const minTimestamp         = Math.trunc(new Date(year, month, day, minHour, minMinute, 0).getTime() / 1000); // Timestamp min

                const [maxHour, maxMinute] = max.split('h');
                const maxTimestamp         = Math.trunc(new Date(year, month, day, maxHour, maxMinute, 0).getTime() / 1000); // Timestamp max

                // On détermine les horaires en fonction du min et du max
                let t = minTimestamp;
                while (t <= maxTimestamp) {
                    if (t >= nowTimestamp + (prepareDelay * 60)) {
                        const hour   = (`0${new Date(t * 1000).getHours()}`).substr(-2);
                        const minute = (`0${new Date(t * 1000).getMinutes()}`).substr(-2);
                        const slot   = `${hour}h${minute}`;

                        // Si l'horaire n'est pas complet, on l'ajoute
                        if (!orders[slot] || (orders[slot] && orders[slot] < currentPOS.maxOrdersPerSlot)) {
                            array.push(slot);
                        }
                    }
                    t += step * 60; // On augmente en fonction de l'intervalle passé en paramètre
                }
            }
        }
    }

    return array;
}

function convertGeoSuggest(suggest) {
    if (suggest === undefined || suggest.gmaps === undefined) return;
    const delivery = {
        street_number : '',
        route         : '',
        locality      : '',
        postal_code   : '',
        country       : '',
        initialAddress: undefined,
    };
    for (let i = 0; i < suggest.gmaps.address_components.length; i++) {
        const valueType     = suggest.gmaps.address_components[i].types[0];
        const valueLong     = suggest.gmaps.address_components[i].long_name;
        const valueShort    = suggest.gmaps.address_components[i].short_name;
        delivery[valueType] = valueLong;
        if (valueType === 'country') {
            delivery.isoCountryCode = valueShort;
        }
    }
    return {
        line1         : delivery.street_number + (delivery.route ? ` ${delivery.route}` : ''),
        zipcode       : delivery.postal_code,
        city          : delivery.locality,
        isoCountryCode: delivery.isoCountryCode,
        country       : delivery.country,
    };
}

function toAquilaAddress(address) {
    if(address.gmaps.address_components[0].types.includes('street_number')) {
        return {
            city          : address.gmaps.address_components[2] ? address.gmaps.address_components[2].long_name : '',
            country       : address.gmaps.address_components[5] ? address.gmaps.address_components[5].long_name : '',
            line1         : address.description.split(', ')[0],
            isoCountryCode: address.gmaps.address_components[5] ? address.gmaps.address_components[5].short_name : '',
            zipcode       : address.gmaps.address_components[6] ? address.gmaps.address_components[6].long_name : '',
        };
    } else {
        return {
            city          : address.gmaps.address_components[1] ? address.gmaps.address_components[1].long_name : '',
            country       : address.gmaps.address_components[4] ? address.gmaps.address_components[4].long_name : '',
            line1         : address.description.split(', ')[0],
            isoCountryCode: address.gmaps.address_components[4] ? address.gmaps.address_components[4].short_name : '',
            zipcode       : address.gmaps.address_components[5] ? address.gmaps.address_components[5].long_name : '',
        };
    }
}

// GET API key for Google Maps 
async function getAPIKeyGMaps() {
    try {
        const response = await axios.get('pointOfSale/getKey');
        return response.data.api_key_google_map;
    } catch(err) {
        console.error('pointsOfSale.getAPIKeyGMaps');
        throw new Error(err?.response?.data?.message);
    }
}

// GET points of sale
async function getPointsOfSale() {
    try {
        const response = await axios.get('pointsOfSale/populate');
        return response.data;
    } catch(err) {
        console.error('pointsOfSale.getPointsOfSale');
        throw new Error(err?.response?.data?.message);
    }
}

// GET point of sale corresponding to an address
async function getPointOfSaleForDelivery(address) {
    try {
        const response = await axios.post('pointsOfSale/findForDelivery', address);
        return response.data;
    } catch(err) {
        console.error('pointsOfSale.getPointOfSaleForDelivery');
        throw new Error(err?.response?.data?.message);
    }
}

// Submit point of sale
async function setPointOfSale(body) {
    try {
        const response = await axios.put('pointOfSale/orderReceipt', body);
        return response.data;
    } catch(err) {
        console.error('pointsOfSale.setPointOfSale');
        throw new Error(err?.response?.data?.message);
    }
}

export default function ClickAndCollect() {
    const [hasWithdrawal, setHasWithdrawal]   = useState(0);
    const [hasDelivery, setHasDelivery]       = useState(0);
    const [deliveryHome, setDeliveryHome]     = useState(0);
    const [pointsOfSale, setPointsOfSale]     = useState([]);
    const [currentPOS, setCurrentPOS]         = useState({});
    const [initialAddress, setInitialAddress] = useState('');
    const [address, setAddress]               = useState('');
    const [isValidAddress, setIsValidAddress] = useState(false);
    const [deliveryDate, setDeliveryDate]     = useState(new Date());
    const [deliveryTime, setDeliveryTime]     = useState('');
    const [schedules, setSchedules]           = useState([]);
    const [message, setMessage]               = useState();
    const [isLoading, setIsLoading]           = useState(false);
    const { lang, t }                         = useTranslation();
    const { cart, setCart }                   = useCart();
    
    moment.locale(lang);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get points of sale
                const data     = await getPointsOfSale();
                const arrayPOS = data.filter(pos => pos.isWithdrawal || pos.isDelivery);
                setPointsOfSale(arrayPOS);

                // Check for the existence of withdrawal and delivery
                let withdrawal = 0;
                let delivery   = 0;
                for (const pos of arrayPOS) {
                    if (pos.isWithdrawal) withdrawal = 1;
                    if (pos.isDelivery) delivery = 1;
                }
                setHasWithdrawal(withdrawal);
                setHasDelivery(delivery);

                // If there is only delivery, we select it
                if (!withdrawal && delivery) {
                    setDeliveryHome(1);
                }

                // If there is only one point of sale, we select it
                if (withdrawal && arrayPOS.filter(pos => pos.isWithdrawal).length === 1) {
                    setCurrentPOS(arrayPOS[0]);
                    getSchedules(arrayPOS[0]);
                }

                // If a point of sale has already been selected, we preselect fields
                if (arrayPOS.find((pos) => pos._id === cart.point_of_sale)) {
                    // Preselect type
                    const localDeliveryHome = cart.orderReceipt.method === 'delivery';
                    setDeliveryHome(localDeliveryHome);

                    // Preselect initial address
                    let localInitialAddress = initialAddress;
                    let localIsValidAddress = isValidAddress;
                    if (localDeliveryHome && cart.addresses?.delivery) {
                        const deliveryAddress = cart.addresses.delivery;
                        localInitialAddress   = ([deliveryAddress.line1, deliveryAddress.city, deliveryAddress.country]).join(', ');
                        localIsValidAddress   = true;
                        setInitialAddress(localInitialAddress);
                        setIsValidAddress(localIsValidAddress);
                    }

                    // Preselect point of sale
                    const localCurrentPOS = arrayPOS.find((pos) => pos._id === cart.point_of_sale);
                    setCurrentPOS(localCurrentPOS);

                    // Preselect date & time
                    const localDeliveryDate = cart.orderReceipt.date ? new Date(cart.orderReceipt.date) : new Date();
                    const localDeliveryTime = cart.orderReceipt.date ? moment(new Date(cart.orderReceipt.date)).format('HH[h]mm') : '';
                    setDeliveryDate(localDeliveryDate);
                    setDeliveryTime(localDeliveryTime);

                    const newDeliveryTime = getSchedules(localCurrentPOS, localDeliveryDate, localDeliveryTime, true);
                    if (newDeliveryTime) {
                        submitPointOfSale('', localCurrentPOS, localDeliveryDate, newDeliveryTime, localDeliveryHome, localIsValidAddress);
                    }
                }
            } catch (err) {
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            }
        };
        fetchData();
    }, []);

    const onChangeDelivery = (e) => {
        setDeliveryHome(Number(e.target.value));
        let pos = {};
        // If there is only one point of sale, we select it
        if (Number(e.target.value) === 0 && pointsOfSale.filter(pos => pos.isWithdrawal).length === 1) {
            pos = pointsOfSale[0];
        }
        setCurrentPOS(pos);
        setInitialAddress('');
        setIsValidAddress(false);
        if (pos._id) {
            getSchedules(pos);
        }
    };

    const onAddressSelect = async (suggest) => {
        const deliveryAddress = convertGeoSuggest(suggest);
        if (!deliveryAddress) {
            return setIsValidAddress(false);
        }
        if (!deliveryAddress.zipcode || !deliveryAddress.line1 || !deliveryAddress.city) {
            setIsValidAddress(false);
            return setMessage({ type: 'error', message: t('modules/pointofsale-aquila:submitAddressError') });
        }
        try {
            const response = await getPointOfSaleForDelivery(deliveryAddress);
            if (response.code === 'CAN_BE_DELIVERED') {
                setAddress(suggest);
                setInitialAddress(([deliveryAddress.line1, deliveryAddress.city, deliveryAddress.country]).join(', '));
                setIsValidAddress(true);
                setCurrentPOS(response.data);
                getSchedules(response.data);
            } else {
                setInitialAddress(([deliveryAddress.line1, deliveryAddress.city, deliveryAddress.country]).join(', '));
                setIsValidAddress(false);
                setCurrentPOS({});
            }
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            setIsValidAddress(false);
            setCurrentPOS({});
        }
    };

    const onChangePos = (e) => {
        let localCurrentPOS = {};
        if (e.target.value) {
            localCurrentPOS = pointsOfSale.find(pos => pos._id === e.target.value);
            getSchedules(localCurrentPOS);
        }
        setCurrentPOS(localCurrentPOS);
    };

    const onChangeDeliveryDate = (date) => {
        setDeliveryDate(date);
        getSchedules(currentPOS, date, '');
    };

    const onChangeDeliveryTime = (e) => {
        setDeliveryTime(e.target.value);
    };

    const getSchedules = (localCurrentPOS, localDeliveryDate = deliveryDate, localDeliveryTime = deliveryTime, preselect = false) => {
        const array = getArraySchedules(localCurrentPOS, localDeliveryDate);
        setSchedules(array);
        if (array.length) {
            if (!localDeliveryTime || !array.includes(localDeliveryTime)) {
                setDeliveryTime(array[0]);
                // If we preselect fields and delivery time is outdated, we return the 1st value of the schedules array
                if (preselect && !array.includes(localDeliveryTime)) {
                    return array[0];
                }
            }
        } else {
            setDeliveryTime('');
        }
        return false;
    };

    const submitPointOfSale = async (e, localCurrentPOS = currentPOS, localDeliveryDate = deliveryDate, localDeliveryTime = deliveryTime, localDeliveryHome = deliveryHome, localIsValidAddress = isValidAddress) => {
        if (e) e.preventDefault();

        setIsLoading(true);
        if (!localDeliveryHome && !localCurrentPOS._id) {
            setIsLoading(false);
            return setMessage({ type: 'error', message: t('modules/pointofsale-aquila:submitError') });
        }
        if (localDeliveryHome && !localIsValidAddress) {
            setIsLoading(false);
            return setMessage({ type: 'error', message: t('modules/pointofsale-aquila:submitError2') });
        }
        const dateToSend = localDeliveryTime.replace('h', ':');
        const body       = {
            pointOfSale  : localCurrentPOS,
            cartId       : cart._id,
            receiptDate  : new Date(`${moment(localDeliveryDate).format('MM/DD/YYYY')} ${dateToSend}`),
            receiptMethod: localDeliveryHome ? 'delivery' : 'withdrawal',
            country      : 'FR',
            dateToSend
        };
        try {
            const response = await setPointOfSale(body);
            setCart(response.data);
            document.cookie = 'cart_id=' + response.data._id + '; path=/;';
            if (localDeliveryHome) {
                // Delivery mode :
                // Address entered by user for cart billing & delivery address
                if (address.gmaps === undefined) {
                    setIsLoading(false);
                    return setMessage({ type: 'info', message: t('modules/pointofsale-aquila:submitSuccess') });
                }
                const addresses = {
                    billing : toAquilaAddress(address),
                    delivery: toAquilaAddress(address)
                };
                const newCart   = await setCartAddresses(response.data._id, addresses);
                setCart(newCart);
            } else {
                // Withdrawal mode :
                // User billing address for cart billing address
                // Point of sale address for cart delivery address
                const idUser = getUserIdFromJwt(document.cookie);
                if (idUser) {
                    const user = await getUser(idUser);
                    if (user) {
                        let billing = user.addresses[user.billing_address];
                        if (!billing) {
                            billing = {
                                city          : '',
                                line1         : '',
                                line2         : '',
                                zipcode       : '',
                                isoCountryCode: ''
                            };
                        }
                        const delivery  = {
                            city          : localCurrentPOS.address.city,
                            line1         : localCurrentPOS.address.line1,
                            line2         : localCurrentPOS.address.line2,
                            zipcode       : localCurrentPOS.address.zipcode,
                            isoCountryCode: 'fr'
                        };
                        const addresses = { billing, delivery };
                        const newCart   = await setCartAddresses(response.data._id, addresses);
                        setCart(newCart);
                    }
                }
            }
            setMessage({ type: 'info', message: t('modules/pointofsale-aquila:submitSuccess') });
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>

            <Head>
                <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC0ISY810uOtckysZpUrTEcrygh8crpd1w&libraries=places" defer></script>
            </Head>
                
            <div className="section-picker">
                <div className="container w-container">
                    <div className="w-form">
                        <form className="form-grid-retrait" onSubmit={submitPointOfSale}>
                            <img src="/images/click-collect.svg" loading="lazy" height="50" alt="" className="image-3" />
                            <label className="checkbox-click-collect w-radio">
                                {
                                    hasWithdrawal === 1 && hasDelivery === 1 && (
                                        <>
                                            <input 
                                                type="radio"
                                                name="deliveryHome"
                                                value={0}
                                                required
                                                checked={deliveryHome ? false : true}
                                                onChange={onChangeDelivery}
                                                style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                            />
                                            <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                        </>
                                    )
                                }
                                {
                                    ((hasWithdrawal === 1 && hasDelivery === 1) || (hasWithdrawal === 1 && hasDelivery !== 1)) && <span className="checkbox-label w-form-label">{t('modules/pointofsale-aquila:withDrawal')}</span>
                                }
                            </label>
                            <label className="checkbox-click-collect w-radio">
                                {
                                    hasWithdrawal === 1 && hasDelivery === 1 && (
                                        <>
                                            <input
                                                type="radio"
                                                name="deliveryHome"
                                                value={1}
                                                required
                                                checked={deliveryHome ? true : false}
                                                onChange={onChangeDelivery}
                                                style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                            />
                                            <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                        </>
                                    )
                                }
                                {
                                    ((hasWithdrawal === 1 && hasDelivery === 1 ) || (hasWithdrawal !== 1 && hasDelivery === 1)) && <span className="checkbox-label w-form-label">{t('modules/pointofsale-aquila:delivery')}</span>
                                }
                            </label>
                            {
                                deliveryHome ? (
                                    <Geosuggest
                                        placeholder=""
                                        inputClassName="text-date w-input"
                                        initialValue={initialAddress}
                                        onSuggestSelect={onAddressSelect}
                                        minLength={4}
                                        queryDelay={300}
                                        country="fr"
                                        types={['geocode']}
                                        required
                                        autoComplete="off"
                                        suggestItemActiveClassName="current"
                                    />
                                ) : (
                                    <select required className="text-ville w-select" value={currentPOS._id} onChange={onChangePos}>
                                        { pointsOfSale.filter(pos => pos.isWithdrawal).length > 1 && <option value="">{t('modules/pointofsale-aquila:selectPOS')}</option> }
                                        {
                                            pointsOfSale?.filter(pos => pos.isWithdrawal)?.map(pos => {
                                                return (
                                                    <option key={pos._id} value={pos._id}>{pos.name}</option>
                                                );
                                            })
                                        }
                                    </select>
                                )
                            }
                            
                            <div>
                                <DatePicker
                                    minDate={new Date()}
                                    value={moment(deliveryDate).format('L')}
                                    selected={deliveryDate}
                                    locale={lang}
                                    required
                                    onChange={onChangeDeliveryDate}
                                    className="text-date w-input"
                                    disabled={!currentPOS._id}
                                />
                            </div>
                            
                            <select required className="select-heure w-select" value={deliveryTime} onChange={onChangeDeliveryTime} disabled={!currentPOS._id || schedules.length === 0}>
                                {
                                    schedules.map((s) => <option key={s} value={s}>{s}</option>)    
                                }
                            </select>
                            <Button 
                                text={t('modules/pointofsale-aquila:submit')}
                                loadingText={t('modules/pointofsale-aquila:submitLoading')}
                                isLoading={isLoading}
                                className="adresse-button w-button"
                            />
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
            </div>
            <style jsx global>
                {`
                    .geosuggest__suggests-wrapper {
                        position: relative;
                    }

                    .geosuggest__suggests {
                        position: absolute;
                        top: -3px;
                        left: 0;
                        right: 0;
                        max-height: 25em;
                        padding: 0;
                        margin-top: -1px;
                        background: #fff;
                        border: 1px solid #3898ec;
                        border-top-width: 0;
                        border-radius: 0 0 5px 5px;
                        overflow-x: hidden;
                        overflow-y: auto;
                        list-style: none;
                        z-index: 5;
                        -webkit-transition: max-height 0.2s, border 0.2s;
                        transition: max-height 0.2s, border 0.2s;
                    }
                    .geosuggest__suggests--hidden {
                        max-height: 0;
                        overflow: hidden;
                        border-width: 0;
                    }

                    /**
                    * A geosuggest item
                    */
                    .geosuggest__item {
                        font-size: 12px;
                        padding: .5em .65em;
                        cursor: pointer;
                    }
                    .geosuggest__item:hover,
                    .geosuggest__item:focus {
                        background: #f5f5f5;
                    }
                    .geosuggest__item--active {
                        background: #267dc0;
                        color: #fff;
                    }
                    .geosuggest__item--active:hover,
                    .geosuggest__item--active:focus {
                        background: #ccc;
                    }
                    .geosuggest__item__matched-text {
                        font-weight: bold;
                    }
                    .w-commerce-commerceerror {
                        margin:20px auto;
                        width:90%;
                    }
                `}
            </style>
        </>
    );
}
