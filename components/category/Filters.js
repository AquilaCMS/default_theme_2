import { useEffect, useRef, useState }                                                     from 'react';
import { useRouter }                                                                       from 'next/router';
import useTranslation                                                                      from 'next-translate/useTranslation';
import Slider                                                                              from 'rc-slider';
import { useCategoryPriceEnd, useCategoryBodyRequest, useCategoryProducts, useSiteConfig } from '@lib/hooks';
import { getBodyRequestProductsFromCookie, convertFilter, filterPriceFix, cloneObj }       from '@lib/utils';

import 'rc-slider/assets/index.css';

export default function Filters({ filtersData, getProductsList }) {
    const formRef                                         = useRef();
    const [open, setOpen]                                 = useState(false);
    const [hasFilters, setHasFilters]                     = useState(false);
    const { categoryPriceEnd, setCategoryPriceEnd }       = useCategoryPriceEnd();
    const { categoryBodyRequest, setCategoryBodyRequest } = useCategoryBodyRequest();
    const { setCategoryProducts }                         = useCategoryProducts();
    const { themeConfig }                                 = useSiteConfig();
    const router                                          = useRouter();
    const { lang, t }                                     = useTranslation();

    // Getting Limit for request
    const defaultLimit = themeConfig?.values?.find(t => t.key === 'productsPerPage')?.value || 16;

    useEffect(() => {
        // Checking if the price, attributes or pictos filters are empty
        if ((categoryBodyRequest.filter?.price?.min || categoryPriceEnd.min) !== categoryPriceEnd.min || 
            (categoryBodyRequest.filter?.price?.max || categoryPriceEnd.max) !== categoryPriceEnd.max || 
            Object.keys(categoryBodyRequest.filter?.attributes || {}).length || 
            categoryBodyRequest.filter?.pictos?.length) {
            setHasFilters(true);
            openBlock(true);
        } else {
            setHasFilters(false);
        }
    }, [categoryBodyRequest]);

    const handlePriceFilterChange = async (value) => {
        const bodyRequest = cloneObj(categoryBodyRequest);
        if (!bodyRequest.filter) {
            bodyRequest.filter = {};
        }
        bodyRequest.filter.price = { min: value[0], max: value[1] };
        setCategoryBodyRequest(bodyRequest);
    };

    const handlePriceFilterAfterChange = async (value) => {
        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        const [minValue, maxValue] = value;

        // If values are the same, do nothing
        if (minValue === (categoryBodyRequest.filter?.price?.min || categoryPriceEnd.min) && maxValue === (categoryBodyRequest.filter?.price?.max || categoryPriceEnd.max)) {
            return;
        }

        // Body request : filter
        if (minValue === categoryPriceEnd.min && maxValue === categoryPriceEnd.max) {
            if (bodyRequestProducts.filter?.price) {
                delete bodyRequestProducts.filter.price;
                if (!Object.keys(bodyRequestProducts.filter).length) {
                    delete bodyRequestProducts.filter;
                }
            }
        } else {
            if (!bodyRequestProducts.filter) {
                bodyRequestProducts.filter = {};
            }
            bodyRequestProducts.filter.price = { min: minValue, max: maxValue };
        }
        const filterRequest = convertFilter(bodyRequestProducts.filter, lang);

        // Body request : page
        if (bodyRequestProducts.page) {
            delete bodyRequestProducts.page;
        }
        const pageRequest = 1;

        // Body request : limit
        let limitRequest = defaultLimit;
        if (bodyRequestProducts.limit) {
            limitRequest = bodyRequestProducts.limit;
        }

        // Body request : sort
        let sortRequest = { sortWeight: -1 };
        if (bodyRequestProducts.sort) {
            const [sortField, sortValue] = bodyRequestProducts.sort.split('|');
            sortRequest                  = { [sortField]: parseInt(sortValue) };
        }

        // Updating the products list
        try {
            const products = await getProductsList({ PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            setCategoryProducts(products);

            const priceEnd = {
                min: Math.floor(products.unfilteredPriceSortMin.ati),
                max: Math.ceil(products.unfilteredPriceSortMax.ati)
            };
    
            // If price end has changed
            if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                // Detecting bad price end in price filter of body request cookie
                filterPriceFix(bodyRequestProducts, priceEnd);
    
                // Setting the new price end
                setCategoryPriceEnd(priceEnd);
            }

            // Setting body request in redux
            setCategoryBodyRequest({ ...bodyRequestProducts });
    
            // Setting body request cookie
            document.cookie = 'bodyRequestProducts=' + encodeURIComponent(JSON.stringify(bodyRequestProducts)) + '; path=/; max-age=43200;';
        } catch (err) {
            console.error(err);
        }
    };

    const handleAttributeFilterClick = async () => {
        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        // Getting checked attributes
        const attributes = {};
        const inputs     = [...formRef.current.elements].filter(elem => elem.nodeName !== 'BUTTON');
        for (const input of inputs) {
            if (input.checked) {
                const [filterType, attributeId, type, value] = input.value.split('|');
                if (filterType === 'attribute') {
                    if (!attributes[attributeId]) {
                        attributes[attributeId] = [];
                    }
                    attributes[attributeId] = [...attributes[attributeId], (type === 'bool' ? value === 'true' : (type === 'number' ? Number(value) : value.toString()))];
                }
            }
        }

        // Body request : filter
        if (Object.keys(attributes).length) {
            if (!bodyRequestProducts.filter) {
                bodyRequestProducts.filter = {};
            }
            bodyRequestProducts.filter.attributes = attributes;
        } else if (bodyRequestProducts.filter?.attributes) {
            delete bodyRequestProducts.filter.attributes;
            if (!Object.keys(bodyRequestProducts.filter).length) {
                delete bodyRequestProducts.filter;
            }
        }
        const filterRequest = convertFilter(bodyRequestProducts.filter, lang);

        // Body request : page
        if (bodyRequestProducts.page) {
            delete bodyRequestProducts.page;
        }
        const pageRequest = 1;

        // Body request : limit
        let limitRequest = defaultLimit;
        if (bodyRequestProducts.limit) {
            limitRequest = bodyRequestProducts.limit;
        }

        // Body request : sort
        let sortRequest = { sortWeight: -1 };
        if (bodyRequestProducts.sort) {
            const [sortField, sortValue] = bodyRequestProducts.sort.split('|');
            sortRequest                  = { [sortField]: parseInt(sortValue) };
        }

        // Updating the products list
        try {
            const products = await getProductsList({ PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            setCategoryProducts(products);

            const priceEnd = {
                min: Math.floor(products.unfilteredPriceSortMin.ati),
                max: Math.ceil(products.unfilteredPriceSortMax.ati)
            };

            // If price end has changed
            if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                // Detecting bad price end in price filter of body request cookie
                filterPriceFix(bodyRequestProducts, priceEnd);

                // Setting the new price end
                setCategoryPriceEnd(priceEnd);
            }
            
            // Setting body request in redux
            setCategoryBodyRequest({ ...bodyRequestProducts });

            // Setting body request cookie
            document.cookie = 'bodyRequestProducts=' + encodeURIComponent(JSON.stringify(bodyRequestProducts)) + '; path=/; max-age=43200;';
        } catch (err) {
            console.error(err);
        }
    };

    const handlePictoFilterClick = async () => {
        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        // Getting checked pictos
        let pictos   = [];
        const inputs = [...formRef.current.elements].filter(elem => elem.nodeName !== 'BUTTON');
        for (const input of inputs) {
            if (input.checked) {
                const [filterType, code] = input.value.split('|');
                if (filterType === 'picto') {
                    pictos = [...pictos, code];
                }
            }
        }

        // Body request : filter
        if (pictos.length) {
            if (!bodyRequestProducts.filter) {
                bodyRequestProducts.filter = {};
            }
            bodyRequestProducts.filter.pictos = pictos;
        } else if (bodyRequestProducts.filter?.pictos) {
            delete bodyRequestProducts.filter.pictos;
            if (!Object.keys(bodyRequestProducts.filter).length) {
                delete bodyRequestProducts.filter;
            }
        }
        const filterRequest = convertFilter(bodyRequestProducts.filter, lang);

        // Body request : page
        if (bodyRequestProducts.page) {
            delete bodyRequestProducts.page;
        }
        const pageRequest = 1;

        // Body request : limit
        let limitRequest = defaultLimit;
        if (bodyRequestProducts.limit) {
            limitRequest = bodyRequestProducts.limit;
        }

        // Body request : sort
        let sortRequest = { sortWeight: -1 };
        if (bodyRequestProducts.sort) {
            const [sortField, sortValue] = bodyRequestProducts.sort.split('|');
            sortRequest                  = { [sortField]: parseInt(sortValue) };
        }

        // Updating the products list
        try {
            const products = await getProductsList({ PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            setCategoryProducts(products);

            const priceEnd = {
                min: Math.floor(products.unfilteredPriceSortMin.ati),
                max: Math.ceil(products.unfilteredPriceSortMax.ati)
            };

            // If price end has changed
            if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                // Detecting bad price end in price filter of body request cookie
                filterPriceFix(bodyRequestProducts, priceEnd);

                // Setting the new price end
                setCategoryPriceEnd(priceEnd);
            }

            // Setting body request in redux
            setCategoryBodyRequest({ ...bodyRequestProducts });

            // Setting body request cookie
            document.cookie = 'bodyRequestProducts=' + encodeURIComponent(JSON.stringify(bodyRequestProducts)) + '; path=/; max-age=43200;';
        } catch (err) {
            console.error(err);
        }
    };

    const resetFilters = async () => {
        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        // Body request : filter
        if (bodyRequestProducts.filter) {
            delete bodyRequestProducts.filter.price;
            delete bodyRequestProducts.filter.attributes;
            delete bodyRequestProducts.filter.pictos;
            if (!Object.keys(bodyRequestProducts.filter).length) {
                delete bodyRequestProducts.filter;
            }
        }
        let filterRequest = convertFilter(bodyRequestProducts.filter, lang);

        // Body request : page
        if (bodyRequestProducts.page) {
            delete bodyRequestProducts.page;
        }
        const pageRequest = 1;

        // Body request : limit
        let limitRequest = defaultLimit;
        if (bodyRequestProducts.limit) {
            limitRequest = bodyRequestProducts.limit;
        }

        // Body request : sort
        let sortRequest = { sortWeight: -1 };
        if (bodyRequestProducts.sort) {
            const [sortField, sortValue] = bodyRequestProducts.sort.split('|');
            sortRequest                  = { [sortField]: parseInt(sortValue) };
        }

        // Updating the products list
        try {
            const products = await getProductsList({ PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            setCategoryProducts(products);

            const priceEnd = {
                min: Math.floor(products.unfilteredPriceSortMin.ati),
                max: Math.ceil(products.unfilteredPriceSortMax.ati)
            };

            // Setting the new price end if has changed
            if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                setCategoryPriceEnd(priceEnd);
            }

            // Setting body request in redux
            setCategoryBodyRequest({ ...bodyRequestProducts });

            // Setting body request cookie
            document.cookie = 'bodyRequestProducts=' + encodeURIComponent(JSON.stringify(bodyRequestProducts)) + '; path=/; max-age=43200;';
        } catch (err) {
            console.error(err);
        }
    };

    const handleLimitChange = async (e) => {
        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        // Body request : filter
        const filterRequest = convertFilter(bodyRequestProducts.filter, lang);

        // Body request : page
        if (bodyRequestProducts.page) {
            delete bodyRequestProducts.page;
        }
        const pageRequest = 1;

        // Body request : limit
        const limitRequest        = Number(e.target.value);
        bodyRequestProducts.limit = limitRequest;

        // Body request : sort
        let sortRequest = { sortWeight: -1 };
        if (bodyRequestProducts.sort) {
            const [sortField, sortValue] = bodyRequestProducts.sort.split('|');
            sortRequest                  = { [sortField]: parseInt(sortValue) };
        }

        // Updating the products list
        try {
            const products = await getProductsList({ PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            setCategoryProducts(products);

            const priceEnd = {
                min: Math.floor(products.unfilteredPriceSortMin.ati),
                max: Math.ceil(products.unfilteredPriceSortMax.ati)
            };

            // If price end has changed
            if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                // Detecting bad price end in price filter of body request cookie
                filterPriceFix(bodyRequestProducts, priceEnd);

                // Setting the new price end
                setCategoryPriceEnd(priceEnd);
            }

            // Setting body request in redux
            setCategoryBodyRequest({ ...bodyRequestProducts });

            // Setting body request cookie
            document.cookie = 'bodyRequestProducts=' + encodeURIComponent(JSON.stringify(bodyRequestProducts)) + '; path=/; max-age=43200;';
        } catch (err) {
            console.error(err);
        }
    };

    const handleSortChange = async (e) => {
        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        // Body request : filter
        const filterRequest = convertFilter(bodyRequestProducts.filter, lang);

        // Body request : page
        if (bodyRequestProducts.page) {
            delete bodyRequestProducts.page;
        }
        const pageRequest = 1;

        // Body request : limit
        let limitRequest = defaultLimit;
        if (bodyRequestProducts.limit) {
            limitRequest = bodyRequestProducts.limit;
        }

        // Body request : sort
        const seletedSort        = e.target.value;
        const [field, value]     = seletedSort.split('|');
        const sortRequest        = { [field]: parseInt(value) };
        bodyRequestProducts.sort = seletedSort;

        // Updating the products list
        try {
            const products = await getProductsList({ PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            setCategoryProducts(products);

            const priceEnd = {
                min: Math.floor(products.unfilteredPriceSortMin.ati),
                max: Math.ceil(products.unfilteredPriceSortMax.ati)
            };

            // If price end has changed
            if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                // Detecting bad price end in price filter of body request cookie
                filterPriceFix(bodyRequestProducts, priceEnd);

                // Setting the new price end
                setCategoryPriceEnd(priceEnd);
            }

            // Setting body request in redux
            setCategoryBodyRequest({ ...bodyRequestProducts });

            // Setting body request cookie
            document.cookie = 'bodyRequestProducts=' + encodeURIComponent(JSON.stringify(bodyRequestProducts)) + '; path=/; max-age=43200;';
        } catch (err) {
            console.error(err);
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
                    {
                        categoryPriceEnd.min !== categoryPriceEnd.max && (
                            <div className="filter">
                                <h6>{t('components/filters:price')}</h6>
                                <div style={{ minWidth: '200px' }}>
                                    <Slider
                                        range
                                        min={categoryPriceEnd.min}
                                        max={categoryPriceEnd.max}
                                        value={[categoryBodyRequest.filter?.price?.min || categoryPriceEnd.min, categoryBodyRequest.filter?.price?.max || categoryPriceEnd.max]}
                                        onChange={handlePriceFilterChange}
                                        onAfterChange={handlePriceFilterAfterChange}
                                    />
                                </div>
                                <span style={{ float: 'left' }}>
                                    {categoryBodyRequest.filter?.price?.min || categoryPriceEnd.min} €
                                </span>
                                <span style={{ float: 'right' }}>
                                    {categoryBodyRequest.filter?.price?.max || categoryPriceEnd.max} €
                                </span>
                            </div>
                        )
                    }
                    {
                        filtersData.attributes.map((attribute) => {
                            if (!filtersData.attributesValues[attribute.id_attribut]) return null;
                            return (
                                <div className="filter" key={attribute.id_attribut}>
                                    <h6>{attribute.name}</h6>
                                    <div>
                                        {
                                            filtersData.attributesValues[attribute.id_attribut].sort().map((value) => {
                                                let checked = false;
                                                if (categoryBodyRequest.filter?.attributes && categoryBodyRequest.filter.attributes[attribute.id_attribut]?.includes(value)) {
                                                    checked = true;
                                                }
                                                return (
                                                    <label className="w-checkbox checkbox-field-allergene" key={`${attribute.id_attribut}-${value}`}>
                                                        <input 
                                                            type="checkbox"
                                                            name="newsletter"
                                                            value={`attribute|${attribute.id_attribut}|${attribute.type}|${value}`}
                                                            checked={checked}
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
                        filtersData.pictos?.length > 0 && (
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
                                                        checked={categoryBodyRequest.filter?.pictos?.includes(picto.code) ? true : false}
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
                        )
                    }
                </div>
                {
                    hasFilters && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <button type="button" className="log-button-03 w-button" onClick={resetFilters}>{t('components/filters:btnReset')}</button>
                        </div>
                    )
                }
                
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div>
                    {t('components/filters:sortBy')} : <select value={categoryBodyRequest.sort || 'sortWeight|-1'} onChange={handleSortChange}>
                        <option value="sortWeight|-1">{t('components/filters:pertinence')}</option>
                        <option value={`translation.${lang}.name|1`}>A-Z</option>
                        <option value={`translation.${lang}.name|-1`}>Z-A</option>
                        <option value="price.priceSort.ati|1">{t('components/filters:price')} -</option>
                        <option value="price.priceSort.ati|-1">{t('components/filters:price')} +</option>
                        <option value="is_new|-1">{t('components/filters:novelty')}</option>
                        <option value="stats.sells|-1">{t('components/filters:sells')}</option>
                        <option value="stats.views|-1" >{t('components/filters:mostViewed')}</option>
                    </select>
                </div>
                <div style={{ marginLeft: '10px' }}>
                    {t('components/filters:limit')} : <select value={categoryBodyRequest.limit || defaultLimit} onChange={handleLimitChange}>
                        <option value="4">4</option>
                        <option value="8">8</option>
                        <option value="16">16</option>
                        <option value="32">32</option>
                    </select>
                </div>
            </div>
        </form>
    );
}