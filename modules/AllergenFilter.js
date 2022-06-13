import { useEffect, useState }                                                             from 'react';
import { useRouter }                                                                       from 'next/router';
import useTranslation                                                                      from 'next-translate/useTranslation';
import { getBlockCMS }                                                                     from '@aquilacms/aquila-connector/api/blockcms';
import { getCategoryProducts }                                                             from '@aquilacms/aquila-connector/api/category';
import axios                                                                               from '@aquilacms/aquila-connector/lib/AxiosInstance';
import { useCategoryBodyRequest, useCategoryProducts, useCategoryPriceEnd, useSiteConfig } from '@lib/hooks';
import { getBodyRequestProductsFromCookie, convertFilter, filterPriceFix }                 from '@lib/utils';

// GET allergens
async function getAllergens() {
    try {
        const response = await axios.post('v2/allergens', { PostBody: { limit: 100 } });
        return response.data.datas;
    } catch(err) {
        console.error('allergen.allergens');
        throw new Error(err?.response?.data?.message);
    }
}

export default function AllergenFilter() {
    const [allergens, setAllergens]                       = useState([]);
    const [checkedAllergens, setCheckedAllergens]         = useState({});
    const [cmsBlockWarning, setCmsBlockWarning]           = useState('');
    const [open, setOpen]                                 = useState(false);
    const [hasFilters, setHasFilters]                     = useState(false);
    const [message, setMessage]                           = useState();
    const router                                          = useRouter();
    const { categoryBodyRequest, setCategoryBodyRequest } = useCategoryBodyRequest();
    const { categoryPriceEnd, setCategoryPriceEnd }       = useCategoryPriceEnd();
    const { setCategoryProducts }                         = useCategoryProducts();
    const { themeConfig }                                 = useSiteConfig();
    const { lang, t }                                     = useTranslation();

    // We determine the slug of the category
    const categorySlugs = Array.isArray(router.query.categorySlugs) ? router.query.categorySlugs : [router.query.categorySlugs];
    const slug          = categorySlugs[categorySlugs.length - 1];

    // Getting Limit
    const defaultLimit = themeConfig?.values?.find(t => t.key === 'productsPerPage')?.value || 16;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get allergens datas
                const data = await getAllergens();
                setAllergens(data);

                // Getting filter & sort from cookie
                const bodyRequestProducts = getBodyRequestProductsFromCookie();

                // Updating checked allergens
                if (bodyRequestProducts.filter?.allergens) {
                    const arrayChecked = bodyRequestProducts.filter.allergens.$or[0].allergens.$nin;
                    let checked        = {};
                    for (const c of arrayChecked) {
                        checked[c] = true;
                    }
                    setCheckedAllergens(checked);
                }
            } catch (err) {
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // Checking if the filter is empty
        if (Object.keys(checkedAllergens).length) {
            setHasFilters(true);
            openBlock(true);
        } else {
            setHasFilters(false);
        }
    }, [checkedAllergens]);

    // Get CMS block cms_allergens
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getBlockCMS('cms_allergens', lang);
                setCmsBlockWarning(data.content);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        fetchData();
    }, []);

    const filterAllergens = async (e, _id) => {
        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        // Updating checked allergens
        const checked = { ...checkedAllergens };
        if (e.target.checked) {
            checked[_id] = true;
        } else {
            delete checked[_id];
        }
        setCheckedAllergens(checked);

        // Body request : filter
        let filterAllergens = {};
        if (Object.keys(checked).length) {
            filterAllergens = {
                $or: [
                    { allergens: { $nin: Object.keys(checked) } },
                    { allergens: [] }
                ]
            };
            if (!bodyRequestProducts.filter) {
                bodyRequestProducts.filter = {};
            }
            bodyRequestProducts.filter.allergens = filterAllergens;
        } else if (bodyRequestProducts.filter?.allergens) {
            delete bodyRequestProducts.filter.allergens;
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
            const products = await getCategoryProducts(slug, '', lang, { PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            setCategoryProducts(products);

            const priceEnd = {
                min: Math.floor(products.unfilteredPriceSortMin.ati),
                max: Math.ceil(products.unfilteredPriceSortMax.ati)
            };
    
            // If price end has changed
            if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                // If filter min or max price are outside of range, reload
                if (bodyRequestProducts.filter?.price && (bodyRequestProducts.filter.price.min > priceEnd.max || bodyRequestProducts.filter.price.max < priceEnd.min)) {
                    return router.reload();
                }

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
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const resetAllergens = async () => {
        setCheckedAllergens([]);

        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        if (bodyRequestProducts.filter?.allergens) {
            // Body request : filter
            delete bodyRequestProducts.filter.allergens;
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
                const products = await getCategoryProducts(slug, '', lang, { PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
                setCategoryProducts(products);

                const priceEnd = {
                    min: Math.floor(products.unfilteredPriceSortMin.ati),
                    max: Math.ceil(products.unfilteredPriceSortMax.ati)
                };

                // If price end has changed
                if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                    // If filter min or max price are outside of range, reload
                    if (bodyRequestProducts.filter?.price && (bodyRequestProducts.filter.price.min > priceEnd.max || bodyRequestProducts.filter.price.max < priceEnd.min)) {
                        return router.reload();
                    }
                
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
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            }
        }
    };

    const openBlock = (force = undefined) => {
        setOpen(force || !open);
    };

    return (
        <div className="div-block-allergenes">
            <div className="faq-question-wrap">
                <div className="lien_alergenes w-inline-block" onClick={() => openBlock()}>
                    <h6 className="heading-6-center">
                        {t('modules/allergen-aquila:checkedAllergens')}
                    </h6>
                    <img src="/images/Plus.svg" alt="" className="plus" />
                </div>
                <div className={`faq-content${open ? ' faq-question-open' : ''}`}>
                    <div className="text-span-center">{cmsBlockWarning}</div>
                    <div className="form-block w-form">
                        <form>
                            <div className="form alergies">
                                {
                                    allergens.map((allergen) => {
                                        return (
                                            <label key={allergen._id} className="w-checkbox checkbox-field-allergene">
                                                <input 
                                                    type="checkbox"
                                                    style={{ opacity: 0, position: 'absolute', zIndex: -1 }} 
                                                    checked={checkedAllergens[allergen._id] ? true : false}
                                                    onChange={(e) => filterAllergens(e, allergen._id)}
                                                />
                                                <div className={'w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene'} />
                                                <span className="checkbox-label-allergene w-form-label">{allergen.name}</span>
                                            </label>
                                        );
                                    })
                                }
                            </div>
                            {
                                hasFilters && (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <button type="button" className="log-button-03 w-button" onClick={resetAllergens}>{t('modules/allergen-aquila:reset')}</button>
                                    </div>
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
            </div>
        </div>
    );
}