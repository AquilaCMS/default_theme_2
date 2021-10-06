import { useEffect, useRef, useState }                                              from 'react';
import { useRouter }                                                                from 'next/router';
import useTranslation                                                               from 'next-translate/useTranslation';
import Slider                                                                       from 'rc-slider';
import { useCategoryPriceEnd, useCategoryPage, useCategoryProducts, useSiteConfig } from '@lib/hooks';
import { getFilterAndSortFromCookie, convertFilter, unsetCookie }                   from '@lib/utils';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range                   = createSliderWithTooltip(Slider.Range);

import 'rc-slider/assets/index.css';

export default function Filters({ filtersData, getProductsList }) {
    const formRef                                                 = useRef();
    const { categoryPriceEnd }                                    = useCategoryPriceEnd();
    const [checkedAttributesFilters, setCheckedAttributesFilters] = useState({});
    const [checkedPictosFilters, setCheckedPictosFilters]         = useState([]);
    const [sort, setSort]                                         = useState({ sortWeight: -1 });
    const [priceValue, setPriceValue]                             = useState([categoryPriceEnd.min, categoryPriceEnd.max]);
    const [open, setOpen]                                         = useState(false);
    const { setCategoryPage }                                     = useCategoryPage();
    const { setCategoryProducts }                                 = useCategoryProducts();
    const { themeConfig }                                         = useSiteConfig();
    const router                                                  = useRouter();
    const { lang, t }                                             = useTranslation();

    // Getting Limit for request
    const limit = themeConfig?.values?.find(t => t.key === 'productsPerPage')?.value || 15;

    // Getting URL page
    const [url] = router.asPath.split('?');

    useEffect(() => {
        // Getting filter from cookie
        const { filter } = getFilterAndSortFromCookie();
        if (filter.conditions && Object.entries(filter.conditions).length) {
            // Opening the filter block
            openBlock(true);
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
            const [key, value] = Object.entries(filter.sort)[0];
            setSort(`${key}|${value}`);
        }
    }, [url]);

    const handlePriceFilterChange = async (value) => {
        setPriceValue(value);
    };

    const handlePriceFilterAfterChange = async (value) => {
        // Getting filter & sort from cookie
        const { filter, sort } = getFilterAndSortFromCookie();

        // If filter empty (cookie not present), reload
        if (!Object.keys(filter).length) {
            return router.reload();
        }

        if (value[0] === categoryPriceEnd.min && value[1] === categoryPriceEnd.max) {
            delete filter.priceValues;
        } else {
            filter.priceValues = { min: value[0], max: value[1] };
        }

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/; max-age=43200;';

        // Getting & updating the products list
        const products = await getProductsList({ PostBody: { filter: convertFilter(filter), page: 1, limit, sort } });
        setCategoryProducts(products);

        // Force page 1
        setCategoryPage(1);

        // Page 1... so useless "page" cookie
        unsetCookie('page');
    };

    const handleAttributeFilterClick = async (e) => {
        // Getting filter & sort from cookie
        const { filter, sort } = getFilterAndSortFromCookie();

        // If filter empty (cookie not present), reload
        if (!Object.keys(filter).length) {
            return router.reload();
        }

        // Getting checked attributes
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

        filter.conditions.attributes = conditions;
        if (!filter.conditions.attributes.length) {
            delete filter.conditions.attributes;
        }

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/; max-age=43200;';

        // Getting & updating the products list
        const products = await getProductsList({ PostBody: { filter: convertFilter(filter), page: 1, limit, sort } });
        setCategoryProducts(products);

        // Force page 1
        setCategoryPage(1);

        // Page 1... so useless "page" cookie
        unsetCookie('page');
    };

    const handlePictoFilterClick = async (e) => {
        // Getting filter & sort from cookie
        const { filter, sort } = getFilterAndSortFromCookie();

        // If filter empty (cookie not present), reload
        if (!Object.keys(filter).length) {
            return router.reload();
        }

        // Getting checked pictos
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

        filter.conditions.pictos = conditions;
        if (!pictos.length) {
            delete filter.conditions.pictos;
        }

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/; max-age=43200;';

        // Getting & updating the products list
        const products = await getProductsList({ PostBody: { filter: convertFilter(filter), page: 1, limit, sort } });
        setCategoryProducts(products);

        // Force page 1
        setCategoryPage(1);

        // Page 1... so useless "page" cookie
        unsetCookie('page');
    };

    const resetFilters = async (e) => {
        // Getting filter & sort from cookie
        const { filter, sort } = getFilterAndSortFromCookie();

        // If filter empty (cookie not present), reload
        if (!Object.keys(filter).length) {
            return router.reload();
        }

        // Price filter must be present (Aquila constraint)
        filter.conditions = { price: { $or: [{ 'price.ati.normal': { $gte: categoryPriceEnd.min, $lte: categoryPriceEnd.max } }, { 'price.ati.special': { $gte: categoryPriceEnd.min, $lte: categoryPriceEnd.max } }] } };

        delete filter.priceValues;
        
        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/; max-age=43200;';

        // Reset attributes, pictos & price
        setPriceValue([categoryPriceEnd.min, categoryPriceEnd.max]);
        setCheckedAttributesFilters({});
        setCheckedPictosFilters([]);

        // Getting & updating the products list
        const products = await getProductsList({ PostBody: { filter: convertFilter(filter), page: 1, limit, sort } });
        setCategoryProducts(products);

        // Force page 1
        setCategoryPage(1);

        // Page 1... so useless "page" cookie
        unsetCookie('page');
    };

    const handleSortChange = async (e) => {
        // Getting filter from cookie
        const { filter } = getFilterAndSortFromCookie();

        // If filter empty (cookie not present), reload
        if (!Object.keys(filter).length) {
            return router.reload();
        }

        // Setting sort
        setSort(e.target.value);
        const [field, value] = e.target.value.split('|');
        filter.sort          = { [field]: parseInt(value) };

        // Setting filter cookie
        document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/; max-age=43200;';

        // Getting & updating the products list
        const products = await getProductsList({ PostBody: { filter: convertFilter(filter), page: 1, limit, sort: filter.sort } });
        setCategoryProducts(products);

        // Force page 1
        setCategoryPage(1);

        // Page 1... so useless "page" cookie
        unsetCookie('page');
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
                    <div className="filter" hidden={categoryPriceEnd.min === categoryPriceEnd.max}>
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
                        filtersData.attributes.map((attribute) => {
                            const attId = attribute._id || attribute.id_attribut;
                            if (!filtersData.attributesValues[attId]) return null;
                            return (
                                <div className="filter" key={attId}>
                                    <h6>{attribute.name}</h6>
                                    <div>
                                        {
                                            filtersData.attributesValues[attId].map((value) => {
                                                return (
                                                    <label className="w-checkbox checkbox-field-allergene" key={attId + value}>
                                                        <input 
                                                            type="checkbox"
                                                            name="newsletter"
                                                            value={`attribute|${attId}|${value}`}
                                                            checked={checkedAttributesFilters[attId]?.includes(value) ? true : false}
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
                    {
                        // TODO to review because:
                        // Displayed only if there are attribute type filters
                        // The switch in the back office so that this filter does not appear does not work
                        /*filtersData.pictos?.length > 0 && (
                            <div className="filter">
                                <h6>{t('components/filters:pictogram')}</h6>
                                <div>
                                    {
                                        filtersData.pictos.map((picto) => {
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
                        )*/
                    }
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
        </form>
    );
}