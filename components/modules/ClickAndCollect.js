import { useEffect, useState }                 from 'react';
import useTranslation                          from 'next-translate/useTranslation';
import moment                                  from 'moment';
import DatePicker, { registerLocale }          from 'react-datepicker';
import fr                                      from 'date-fns/locale/fr';
import { setCartAddresses }                    from '@lib/aquila-connector/cart';
import { setPointOfSale }                      from '@lib/aquila-connector/pointsOfSale';
import { useCartId, usePointsOfSale, useUser } from '@lib/hooks';
import { getArraySchedules }                   from '@lib/utils';

import 'react-datepicker/dist/react-datepicker.css';

registerLocale('fr', fr);

export default function ClickAndCollect() {
    const [deliveryHome, setDeliveryHome] = useState(0);
    const [currentPOS, setCurrentPOS]     = useState({});
    const [deliveryDate, setDeliveryDate] = useState(new Date());
    const [deliveryTime, setDeliveryTime] = useState('');
    const [schedules, setSchedules]       = useState([]);
    const [message, setMessage]           = useState();
    const { lang, t }                     = useTranslation();
    let pointsOfSale                      = usePointsOfSale();
    pointsOfSale                          = pointsOfSale.filter(pos => pos.isWithdrawal || pos.isDelivery);
    const user                            = useUser();
    const cartId                          = useCartId();
    
    moment.locale(lang);
    
    useEffect(() => {
        
    }, []);

    const onChangePos = (e) => {
        let pos = {};
        if (e.target.value) {
            pos = pointsOfSale.find(pos => pos._id === e.target.value);
            getSchedules(pos);
        }
        setCurrentPOS(pos);
    };

    const onChangeDeliveryDate = (date) => {
        setDeliveryDate(date);
        getSchedules(currentPOS, date);
    };

    const onChangeDeliveryTime = (e) => {
        setDeliveryTime(e.target.value);
    };

    const getSchedules = (pos, date = deliveryDate) => {
        const array = getArraySchedules(pos, date);
        setSchedules(array);
        if (array.length) {
            setDeliveryTime(array[0]);
        }
    };

    const submitPointOfSale = async (e) => {
        e.preventDefault();
        if (!deliveryTime) {
            return setMessage({ type: 'info', message: t('components/clickAndCollect:submitError') });
        }
        const dateToSend = deliveryTime.replace('h', ':');
        const body       = {
            pointOfSale  : currentPOS,
            cartId,
            receiptDate  : new Date(`${moment(deliveryDate).format('MM/DD/YYYY')} ${dateToSend}`),
            receiptMethod: 'withdrawal',
            dateToSend
        };
        try {
            const response = await setPointOfSale(body);
            if (response.data._id) {
                if (user) {
                    const delivery  = {
                        city          : currentPOS.address.city,
                        isoCountryCode: 'fr',
                        line1         : currentPOS.address.line1,
                        zipcode       : currentPOS.address.zipcode
                    };
                    const addresses = { billing: user.addresses[user.billing_address], delivery };
                    await setCartAddresses(response.data._id, addresses);
                    setMessage({ type: 'info', message: t('components/clickAndCollect:submitSuccess') });
                }
            }
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    return (
        <>
            <div className="section-picker">
                <div className="container w-container">
                    <div className="w-form">
                        <form className="form-grid-retrait" onSubmit={submitPointOfSale}>
                            <img src="/images/click-collect.svg" loading="lazy" height="50" alt="" className="image-3" />
                            <label className="checkbox-click-collect w-radio">
                                <input 
                                    type="radio"
                                    name="deliveryHome"
                                    value={0}
                                    required
                                    checked={deliveryHome ? false : true}
                                    onChange={(e) => setDeliveryHome(Number(e.target.value))}
                                    style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                />
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                <span className="checkbox-label w-form-label">{t('components/clickAndCollect:withDrawal')}</span>
                            </label>
                            <label className="checkbox-click-collect w-radio">
                                <input
                                    type="radio"
                                    name="deliveryHome"
                                    value={1}
                                    required
                                    checked={deliveryHome ? true : false}
                                    onChange={(e) => setDeliveryHome(Number(e.target.value))}
                                    style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                />
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                <span className="checkbox-label w-form-label">{t('components/clickAndCollect:delivery')}</span>
                            </label>
                            <select className="text-ville w-select" value={currentPOS._id} onChange={onChangePos}>
                                <option value="">{t('components/clickAndCollect:selectPOS')}</option>
                                {
                                    pointsOfSale?.filter(pos => pos.isWithdrawal)?.map(pos => {
                                        return (
                                            <option key={pos._id} value={pos._id}>{pos.name}</option>
                                        );
                                    })
                                }
                            </select>
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
                            <select required className="select-heure w-select" onChange={onChangeDeliveryTime} disabled={!currentPOS._id || schedules.length === 0}>
                                {
                                    schedules.map((s) => <option key={s} value={s}>{s}</option>)    
                                }
                            </select>
                            <button type="submit" className="adresse-button w-button">{t('components/clickAndCollect:submit')}</button>
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
            {/* <div className="section-picker">
                <div className="container w-container">
                    <div className="form-block-2 w-form">
                        <form id="email-form-2" name="email-form-2" data-name="Email Form 2" className="form-grid-livraison">
                            <img src="images/click-collect.svg" loading="lazy" height="50" id="w-node-de72c864-5a9f-7b7b-fa59-e5995a958c81-5a958c7d" alt="" className="image-3" />
                            <label id="w-node-de72c864-5a9f-7b7b-fa59-e5995a958c82-5a958c7d" className="checkbox-click-collect w-radio">
                                <input type="radio" data-name="Radio" id="retrait" name="Radio" value="Radio" required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                <span className="checkbox-label w-form-label">Retrait</span>
                            </label>
                            <label id="w-node-de72c864-5a9f-7b7b-fa59-e5995a958c86-5a958c7d" className="checkbox-click-collect w-radio">
                                <input type="radio" data-name="Radio" id="retrait" name="Radio" value="Radio" required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                <span className="checkbox-label w-form-label">Livraison</span>
                            </label>
                            <input type="text" className="text-field-adresse w-node-de72c864-5a9f-7b7b-fa59-e5995a958c8a-5a958c7d w-input" maxLength="256" name="adresse-2" data-name="Adresse 2" placeholder="Saisir une adresse" id="adresse-2" required="" />
                            <a id="w-node-de72c864-5a9f-7b7b-fa59-e5995a958c8b-5a958c7d" href="#" className="adresse-button w-button">Vérifier mon adresse</a><input type="text" className="text-field-date-livraison w-node-de72c864-5a9f-7b7b-fa59-e5995a958c8d-5a958c7d w-input" maxLength="256" name="field" data-name="Field" placeholder="Date. -- / -- / --" id="DatepickerBox2" required="" /><select id="field-2" name="field-2" required="" className="select-heure-livraison w-node-de72c864-5a9f-7b7b-fa59-e5995a958c8e-5a958c7d w-select">
                                <option value="11-00">11h00</option>
                                <option value="11-15">11h15</option>
                                <option value="11-30">11h30</option>
                                <option value="11-45">11h45</option>
                                <option value="12-00">12h00</option>
                                <option value="12-15">12h15</option>
                                <option value="12-30">12h30</option>
                                <option value="12-45">12h45</option>
                                <option value="13-00">13h00</option>
                            </select>
                        </form>
                        <div className="w-form-done">
                            <div>Thank you! Your submission has been received!</div>
                        </div>
                        <div className="w-form-fail">
                            <div>Oops! Something went wrong while submitting the form.</div>
                        </div>
                    </div>
                </div>
            </div> */}
        </>
    );
}
