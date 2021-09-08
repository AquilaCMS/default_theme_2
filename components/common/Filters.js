import { useEffect, useRef, useState }                               from 'react';
import useTranslation                                                from 'next-translate/useTranslation';
import cookie                                                        from 'cookie';
import Slider                                                        from 'rc-slider';
import { getCategoryProducts }                                       from 'aquila-connector/api/category';
import { useCategoryPage, useCategoryPriceEnd, useCategoryProducts } from '@lib/hooks';
import { cloneObj, convertFilter, unsetCookie }                      from '@lib/utils';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range                   = createSliderWithTooltip(Slider.Range);

import 'rc-slider/assets/index.css';

export default function Filters({ category, limit }) {
    const formRef                                                 = useRef();
    const { categoryPriceEnd }                                    = useCategoryPriceEnd();
    const [checkedAttributesFilters, setCheckedAttributesFilters] = useState({});
    const [checkedPictosFilters, setCheckedPictosFilters]         = useState([]);
    const [sort, setSort]                                         = useState({ sortWeight: -1 });
    const [priceValue, setPriceValue]                             = useState([categoryPriceEnd.min, categoryPriceEnd.max]);
    const [open, setOpen]                                         = useState(false);
    const [message, setMessage]                                   = useState();
    const { setCategoryPage }                                     = useCategoryPage();
    const { setCategoryProducts }                                 = useCategoryProducts();
    const { lang, t }                                             = useTranslation();

    useEffect(() => {
        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
            if (Object.entries(filter.conditions).length) {
                // Opening the filter block
                openBlock(true);
            }
        }

        // Init price filter
        if (!filter.priceValues) { 
            setPriceValue([categoryPriceEnd.min, categoryPriceEnd.max]);
        } else {
            setPriceValue([filter.priceValues.min, filter.priceValues.max]);
        }

        // Init attributes filters
        let checkedArray = {};
        if (filter.conditions?.attributes) {
            for (let attribute of filter.conditions.attributes) {
                checkedArray[attribute.attributes.$elemMatch.id] = attribute.attributes.$elemMatch[`translation.${lang}.value`].$in;
            }
        }
        setCheckedAttributesFilters(checkedArray);

        // Init pictos filters
        checkedArray = [];
        if (filter.conditions?.pictos) {
            checkedArray = filter.conditions.pictos[0].pictos.$elemMatch.code.$in;
        }
        setCheckedPictosFilters(checkedArray);

        // Init sort
        if (filter.sort) {
            const sort         = JSON.parse(filter.sort);
            const [key, value] = Object.entries(sort)[0];
            setSort(`${key}|${value}`);
        }
    }, [category, categoryPriceEnd]);

    const handlePriceFilterChange = async (value) => {
        setPriceValue(value);
    };

    const handlePriceFilterAfterChange = async (value) => {
        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        let sort           = { sortWeight: -1 };
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
            if (filter.sort) {
                sort = JSON.parse(filter.sort);
            }
        }

        if (value[0] === categoryPriceEnd.min && value[1] === categoryPriceEnd.max) {
            delete filter.priceValues;
        } else {
            filter.priceValues = { min: value[0], max: value[1] };
        }

        // If filter empty (cookie not present)
        if (!filter.conditions) {
            filter.conditions = {};
        }
        filter.conditions.price = { $or: [{ 'price.ati.normal': { $gte: value[0], $lte: value[1] } }, { 'price.ati.special': { $gte: value[0], $lte: value[1] } }] };

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';

        // Updating the products list
        try {
            const products = await getCategoryProducts({ id: category._id, lang, postBody: { PostBody: { filter: convertFilter(filter), page: 1, limit, sort } } });
            setCategoryProducts(products);

            // Back to page 1
            setCategoryPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const handleAttributeFilterClick = async (e) => {
        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        let sort           = { sortWeight: -1 };
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
            if (filter.sort) {
                sort = JSON.parse(filter.sort);
            }
        }

        // Get checked attributes
        const attributes = {};
        const inputs     = [...formRef.current.elements].filter(elem => elem.nodeName !== 'BUTTON');
        for (const input of inputs) {
            if (input.checked) {
                const [type, attributeId, value] = input.value.split('|');
                if (type === 'attribute') {
                    if (!attributes[attributeId]) {
                        attributes[attributeId] = [];
                    }
                    attributes[attributeId] = [...attributes[attributeId], (value === 'true' || value === 'false' ? value === 'true' : value.toString())];
                }
            }
        }
        setCheckedAttributesFilters(attributes);
        
        let conditions = [];
        for (const [attributeId, values] of Object.entries(attributes)) {
            conditions.push({ attributes: { $elemMatch: { [`translation.${lang}.value`]: { $in: values }, id: attributeId } } });
        }

        // If filter empty (cookie not present)
        if (!filter.conditions) {
            // Price filter must be present
            filter.conditions = { price: { $or: [{ 'price.ati.normal': { $gte: categoryPriceEnd.min, $lte: categoryPriceEnd.max } }, { 'price.ati.special': { $gte: categoryPriceEnd.min, $lte: categoryPriceEnd.max } }] } };
            setPriceValue([categoryPriceEnd.min, categoryPriceEnd.max]);
        }

        filter.conditions.attributes = conditions;
        if (!filter.conditions.attributes.length) {
            delete filter.conditions.attributes;
        }

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';

        // Updating the products list
        try {
            const products = await getCategoryProducts({ id: category._id, lang, postBody: { PostBody: { filter: convertFilter(filter), page: 1, limit, sort } } });
            setCategoryProducts(products);

            // Back to page 1
            setCategoryPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const handlePictoFilterClick = async (e) => {
        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        let sort           = { sortWeight: -1 };
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
            if (filter.sort) {
                sort = JSON.parse(filter.sort);
            }
        }

        // Get checked pictos
        let pictos   = [];
        const inputs = [...formRef.current.elements].filter(elem => elem.nodeName !== 'BUTTON');
        for (const input of inputs) {
            if (input.checked) {
                const [type, code] = input.value.split('|');
                if (type === 'picto') {
                    pictos = [...pictos, code];
                }
            }
        }
        setCheckedPictosFilters(pictos);
        
        let conditions = [{ pictos: { $elemMatch: { code: { $in: pictos } } } }];

        // If filter empty (cookie not present)
        if (!filter.conditions) {
            // Price filter must be present
            filter.conditions = { price: { $or: [{ 'price.ati.normal': { $gte: categoryPriceEnd.min, $lte: categoryPriceEnd.max } }, { 'price.ati.special': { $gte: categoryPriceEnd.min, $lte: categoryPriceEnd.max } }] } };
            setPriceValue([categoryPriceEnd.min, categoryPriceEnd.max]);
        }

        filter.conditions.pictos = conditions;
        if (!pictos.length) {
            delete filter.conditions.pictos;
        }

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';

        // Updating the products list
        try {
            const products = await getCategoryProducts({ id: category._id, lang, postBody: { PostBody: { filter: convertFilter(filter), page: 1, limit, sort } } });
            setCategoryProducts(products);

            // Back to page 1
            setCategoryPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const resetFilters = async (e) => {
        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        let sort           = { sortWeight: -1 };
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
            if (filter.sort) {
                sort = JSON.parse(filter.sort);
            }
        }

        // Price filter must be present
        filter.conditions = { price: { $or: [{ 'price.ati.normal': { $gte: categoryPriceEnd.min, $lte: categoryPriceEnd.max } }, { 'price.ati.special': { $gte: categoryPriceEnd.min, $lte: categoryPriceEnd.max } }] } };

        delete filter.priceValues;
        
        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';

        // Reset attributes, pictos & price
        setPriceValue([categoryPriceEnd.min, categoryPriceEnd.max]);
        setCheckedAttributesFilters({});
        setCheckedPictosFilters([]);

        // Updating the products list
        try {
            const products = await getCategoryProducts({ id: category._id, lang, postBody: { PostBody: { filter: {}, page: 1, limit, sort } } });
            setCategoryProducts(products);

            // Back to page 1
            setCategoryPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const handleSortChange = async (e) => {
        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
        }

        // Setting sort
        setSort(e.target.value);
        const [field, value] = e.target.value.split('|');
        const sort           = { [field]: parseInt(value) };

        filter.sort = JSON.stringify(sort);

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';

        // Updating the products list
        try {
            const products = await getCategoryProducts({ id: category._id, lang, postBody: { PostBody: { filter: convertFilter(filter), page: 1, limit, sort } } });
            setCategoryProducts(products);

            // Back to page 1
            setCategoryPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const openBlock = (force = undefined) => {
        setOpen(force || !open);
    };

    return (
        <form ref={formRef} className="filters">
            <div className="lien_alergenes w-inline-block" onClick={() => openBlock()}>
                <h6 className="heading-6-center">{t('components/filters:title')}</h6>
                <img src="/images/Plus.svg" alt="" className="plus" />
            </div>
            <div className={`faq-content${open ? ' filters-open' : ''}`}>
                <div className="filters-list">
                    <div className="filter">
                        <h6>{t('components/filters:price')}</h6>
                        <div style={{ minWidth: '200px' }}>
                            <Range
                                min={categoryPriceEnd.min}
                                max={categoryPriceEnd.max}
                                tipFormatter={value => `${value}€`}
                                value={[priceValue[0], priceValue[1]]}
                                onChange={handlePriceFilterChange}
                                onAfterChange={handlePriceFilterAfterChange}
                            />
                        </div>
                        <span style={{ float: 'left' }}>
                            {categoryPriceEnd.min} €
                        </span>
                        <span style={{ float: 'right' }}>
                            {categoryPriceEnd.max} €
                        </span>
                    </div>
                    {
                        category.filters.attributes.map((attribute) => {
                            return (
                                <div className="filter" key={attribute._id}>
                                    <h6>{attribute.name}</h6>
                                    <div>
                                        {
                                            category.filters.attributesValues[attribute._id].map((value) => {
                                                return (
                                                    <label className="w-checkbox checkbox-field-allergene" key={attribute._id + value}>
                                                        <input 
                                                            type="checkbox"
                                                            name="newsletter"
                                                            value={`attribute|${attribute._id}|${value}`}
                                                            checked={checkedAttributesFilters[attribute._id]?.includes(value) ? true : false}
                                                            onChange={handleAttributeFilterClick}
                                                            style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                                        />
                                                        <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene"></div>
                                                        <span className="checkbox-label-allergene w-form-label" style={attribute.type === 'color' ? { width: '50px', height: '20px', backgroundColor: value, borderRadius: '5px' } : {}}>
                                                            {attribute.type === 'bool' ? (value ? t('components/filters:yes') : t('components/filters:no')) : (attribute.type === 'color' ? '' : value)}
                                                        </span>
                                                    </label>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            );
                        })
                    }
                    <div className="filter">
                        <h6>{t('components/filters:pictogram')}</h6>
                        <div>
                            {
                                category.filters.pictos.map((picto) => {
                                    return (
                                        <label className="w-checkbox checkbox-field-allergene" key={picto._id}>
                                            <input 
                                                type="checkbox"
                                                name="newsletter"
                                                value={`picto|${picto.code}`}
                                                checked={checkedPictosFilters.includes(picto.code) ? true : false}
                                                onChange={handlePictoFilterClick}
                                                style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                            />
                                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene"></div>
                                            <span className="checkbox-label-allergene w-form-label">{picto.title}</span>
                                        </label>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <button type="button" className="log-button-03 w-button" onClick={resetFilters}>{t('components/filters:btnReset')}</button>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div>
                    {t('components/filters:sortBy')} <select value={sort} onChange={handleSortChange}>
                        <option value="sortWeight|-1">{t('components/filters:pertinence')}</option>
                        <option value={`translation.${lang}.name|1`}>A-Z</option>
                        <option value={`translation.${lang}.name|-1`}>Z-A</option>
                        <option value="price.ati.normal|1">{t('components/filters:price')} -</option>
                        <option value="price.ati.normal|-1">{t('components/filters:price')} +</option>
                        <option value="is_new|-1">{t('components/filters:novelty')}</option>
                    </select>
                </div>
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
        </form>
    );
}