import { useEffect, useState }                                                    from 'react';
import { useRouter }                                                              from 'next/router';
import useTranslation                                                             from 'next-translate/useTranslation';
import { getBlockCMS }                                                            from '@aquilacms/aquila-connector/api/blockcms';
import { getCategoryProducts }                                                    from '@aquilacms/aquila-connector/api/category';
import axios                                                                      from '@aquilacms/aquila-connector/lib/AxiosInstance';
import { useSelectPage, useCategoryProducts, useCategoryPriceEnd, useSiteConfig } from '@lib/hooks';
import { getFilterAndSortFromCookie, convertFilter, unsetCookie }                 from '@lib/utils';

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
    const [allergens, setAllergens]               = useState([]);
    const [checkedAllergens, setCheckedAllergens] = useState({});
    const [cmsBlockWarning, setCmsBlockWarning]   = useState('');
    const [open, setOpen]                         = useState(false);
    const [message, setMessage]                   = useState();
    const router                                  = useRouter();
    const { setSelectPage }                       = useSelectPage();
    const { setCategoryProducts }                 = useCategoryProducts();
    const { categoryPriceEnd }                    = useCategoryPriceEnd();
    const { themeConfig }                         = useSiteConfig();
    const { lang, t }                             = useTranslation();

    // We determine the slug of the category
    const categorySlugs = Array.isArray(router.query.categorySlugs) ? router.query.categorySlugs : [router.query.categorySlugs];
    const slug          = categorySlugs[categorySlugs.length - 1];

    // Getting Limit
    const limit = themeConfig?.values?.find(t => t.key === 'productsPerPage')?.value || 15;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get allergens datas
                const data = await getAllergens();
                setAllergens(data);

                // Getting filter & sort from cookie
                const { filter } = getFilterAndSortFromCookie();

                // Updating checked allergens
                if (filter.conditions?.allergens) {
                    const arrayChecked = filter.conditions.allergens.$or[0].allergens.$nin;
                    let checked        = {};
                    for (const c of arrayChecked) {
                        checked[c] = true;
                    }
                    setCheckedAllergens(checked);

                    // Opening the allergens block
                    openBlock(true);
                }
            } catch (err) {
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            }
        };
        fetchData();
    }, []);

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
        // Getting filter & sort from cookie
        const { filter, sort } = getFilterAndSortFromCookie();

        // If the filter does not have the "category" property, reload
        if (!filter.category) {
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

        // Filter construction
        let filterAllergens = {};
        if (Object.keys(checked).length > 0) {
            filterAllergens = {
                $or: [
                    { allergens: { $nin: Object.keys(checked) } },
                    { allergens: [] }
                ]
            };
            if (!filter.conditions) {
                filter.conditions = {};
            }
            filter.conditions.allergens = filterAllergens;
        } else {
            delete filter.conditions.allergens;
        }

        // Setting filter cookie
        document.cookie = 'filter=' + encodeURIComponent(JSON.stringify(filter)) + '; path=/; max-age=43200;';

        // Updating the products list
        try {
            const products = await getCategoryProducts(slug, '', lang, { PostBody: { filter: convertFilter(filter, lang), page: 1, limit, sort } });
            setCategoryProducts(products);

            const priceEnd = {
                min: Math.floor(products.unfilteredPriceSortMin.ati),
                max: Math.ceil(products.unfilteredPriceSortMax.ati)
            };
    
            // If price end has changed, reload
            if (priceEnd.min !== categoryPriceEnd.min || priceEnd.max !== categoryPriceEnd.max) {
                return router.reload();
            }

            // Back to page 1
            setSelectPage(1);

            // Back to page 1... so useless "page" cookie
            unsetCookie('page');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const resetAllergens = async () => {
        setCheckedAllergens([]);

        // Getting filter & sort from cookie
        const { filter, sort } = getFilterAndSortFromCookie();

        // If the filter does not have the "category" property, reload
        if (!filter.category) {
            return router.reload();
        }

        if (filter.conditions?.allergens) {
            // Filter construction
            delete filter.conditions.allergens;

            // Setting filter cookie
            document.cookie = 'filter=' + encodeURIComponent(JSON.stringify(filter)) + '; path=/; max-age=43200;';

            // Updating the products list
            try {
                const products = await getCategoryProducts(slug, '', lang, { PostBody: { filter: convertFilter(filter, lang), page: 1, limit, sort } });
                setCategoryProducts(products);

                // Back to page 1
                setSelectPage(1);

                // Back to page 1... so useless "page" cookie
                unsetCookie('page');
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
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button type="button" className="log-button-03 w-button" onClick={resetAllergens}>{t('modules/allergen-aquila:reset')}</button>
                            </div>
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