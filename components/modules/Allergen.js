import { useEffect, useState }                  from 'react';
import { useRouter }                            from 'next/router';
import cookie                                   from 'cookie';
import useTranslation                           from 'next-translate/useTranslation';
import { getAllergens }                         from '@lib/aquila-connector/allergen';
import { getCategoryProducts }                  from '@lib/aquila-connector/category';
import { useCategoryPage, useCategoryProducts } from '@lib/hooks';
import { unsetCookie }                          from '@lib/utils';

export default function Allergen({ limit = 15 }) {
    const [allergens, setAllergens]               = useState([]);
    const [checkedAllergens, setCheckedAllergens] = useState({});
    const [open, setOpen]                         = useState(false);
    const [message, setMessage]                   = useState();
    const router                                  = useRouter();
    const { setCategoryPage }                     = useCategoryPage();
    const { setCategoryProducts }                 = useCategoryProducts();
    const { t }                                   = useTranslation();

    // We determine the slug of the category
    const categorySlugs = Array.isArray(router.query.categorySlugs) ? router.query.categorySlugs : [router.query.categorySlugs];
    const slug          = categorySlugs[categorySlugs.length - 1];

    // In the case where we go from one category to another, 
    // we put the "slug" variable in dependence on the useEffect so that it is executed again.
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get allergens datas
                const data = await getAllergens();
                setAllergens(data);

                // If cookie filter exists, we parse it
                const cookieFilter = cookie.parse(document.cookie).filter;
                if (cookieFilter) {
                    const filter = JSON.parse(cookieFilter);

                    // Updating checked allergens
                    const arrayChecked = filter.$or[0].allergens.$nin;
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

    const filterAllergens = async (e, _id) => {
        const checked = { ...checkedAllergens };

        // Updating checked allergens
        if (e.target.checked) {
            checked[_id] = true;
        } else {
            delete checked[_id];
        }
        setCheckedAllergens(checked);

        // Filter construction
        let filter = {};
        if (Object.keys(checked).length > 0) {
            filter = {
                $or: [
                    { allergens: { $nin: Object.keys(checked) } },
                    { allergens: [] }
                ]
            };

            // Setting filter cookie
            document.cookie = 'filter=' + JSON.stringify(filter) + '; path=/;';
        } else {
            unsetCookie('filter');
        }

        // Updating the products list
        try {
            const products = await getCategoryProducts({ slug, id: '', postBody: { PostBody: { filter, page: 1, limit } } });
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
        <div className="div-block-allergenes">
            <div className="faq-question-wrap">
                <div className="lien_alergenes w-inline-block" onClick={() => openBlock()}>
                    <h6 className="heading-6-center">
                        {t('components/allergen:checkedAllergens')}
                    </h6>
                    <img src="/images/Plus.svg" alt="" className="plus" />
                </div>
                <div className={`faq-content${open ? ' faq-question-open' : ''}`}>
                    <div className="text-span-center">{t('components/allergen:warning')}</div>
                    <div className="form-block w-form">
                        <form name="form-alergies" className="form alergies">
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