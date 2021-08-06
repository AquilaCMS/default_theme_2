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
    const formRef                             = useRef();
    const { categoryPriceEnd }                = useCategoryPriceEnd();
    const [checkedFilters, setCheckedFilters] = useState({});
    const [priceValue, setPriceValue]         = useState([categoryPriceEnd.min, categoryPriceEnd.max]);
    const [message, setMessage]               = useState();
    const { setCategoryPage }                 = useCategoryPage();
    const { setCategoryProducts }             = useCategoryProducts();
    const { lang, t }                         = useTranslation();

    useEffect(() => {
        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
        }

        // Init price filter
        if (!filter.priceValues) { 
            setPriceValue([categoryPriceEnd.min, categoryPriceEnd.max]);
            delete filter.priceValues;
            
            // Setting filter cookie
            document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';
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
        setCheckedFilters(checkedArray);
    }, [category, categoryPriceEnd]);

    const handlePriceFilterChange = async (value) => {
        setPriceValue(value);
    };

    const handlePriceFilterAfterChange = async (value) => {
        // Get filter from cookie
        const cookieFilter = cookie.parse(document.cookie).filter;
        let filter         = {};
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
        }

        if (value[0] === categoryPriceEnd.min && value[1] === categoryPriceEnd.max) {
            delete filter.priceValues;
        } else {
            filter.priceValues = { min: value[0], max: value[1] };
        }
        filter.conditions.price = { $or: [{ 'price.ati.normal': { $gte: value[0], $lte: value[1] } }, { 'price.ati.special': { $gte: value[0], $lte: value[1] } }] };

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';

        // Updating the products list
        try {
            const products = await getCategoryProducts({ id: category._id, lang, postBody: { PostBody: { filter: convertFilter(cloneObj(filter)), page: 1, limit } } });
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
        if (cookieFilter) {
            filter = JSON.parse(cookieFilter);
        }

        //
        const attributes = [];
        const inputs     = [...formRef.current.elements].filter(elem => elem.nodeName !== 'BUTTON');
        for (const input of inputs) {
            if (input.checked) {
                const [attributeId, value] = input.value.split('|');

                if (!attributes[attributeId]) {
                    attributes[attributeId] = [];
                }
                attributes[attributeId] = [...attributes[attributeId], value];
            }
        }
        setCheckedFilters(attributes);
        
        let conditions = [];
        for (const [attributeId, values] of Object.entries(attributes)) {
            conditions.push({ attributes: { $elemMatch: { [`translation.${lang}.value`]: { $in: values }, id: attributeId } } });
        }

        filter.conditions.attributes = conditions;
        if (!filter.conditions.attributes.length) {
            delete filter.conditions.attributes;
        }

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';

        // Updating the products list
        try {
            const products = await getCategoryProducts({ id: category._id, lang, postBody: { PostBody: { filter: convertFilter(filter), page: 1, limit } } });
            setCategoryProducts(products);

            // Back to page 1
            setCategoryPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    return (
        <form ref={formRef} className="filters">
            <div style={{ display: 'flex' }}>
                <div style={{ padding: '20px' }}>
                    <h6>Prix</h6>
                    <div style={{ width: '200px' }}>
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
                            <div key={attribute._id} style={{ padding: '20px' }}>
                                <h6>{attribute.name}</h6>
                                <div>
                                    {
                                        category.filters.attributesValues[attribute._id].map((value) => {
                                            return (
                                                <label className="w-checkbox checkbox-field-allergene" key={attribute._id + value}>
                                                    <input 
                                                        type="checkbox"
                                                        name="newsletter"
                                                        value={`${attribute._id}|${value}`}
                                                        checked={checkedFilters[attribute._id]?.includes(value) ? true : false}
                                                        onChange={handleAttributeFilterClick}
                                                        style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                                    />
                                                    <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene"></div>
                                                    <span className="checkbox-label-allergene w-form-label">{value}</span>
                                                </label>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        );
                    })
                }
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