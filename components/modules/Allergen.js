import { useEffect, useState } from 'react';
import { useRouter }           from 'next/router';
import useTranslation          from 'next-translate/useTranslation';
import { getAllergens }        from '@lib/aquila-connector/allergen';
import { getCategoryProducts } from '@lib/aquila-connector/category';
import { useCategoryProducts } from '@lib/hooks';

export default function Allergen() {
    const [allergens, setAllergens]               = useState([]);
    const [checkedAllergens, setCheckedAllergens] = useState({});
    const [open, setOpen]                         = useState(false);
    const [message, setMessage]                   = useState();
    const router                                  = useRouter();
    const { setCategoryProducts }                 = useCategoryProducts();
    const { t }                                   = useTranslation();

    const categorySlugs = Array.isArray(router.query.categorySlugs) ? router.query.categorySlugs : [router.query.categorySlugs];
    const slug          = categorySlugs[categorySlugs.length - 1];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get allergens
                const data = await getAllergens();
                setAllergens(data);
            } catch (err) {
                setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
            }
        };
        fetchData();
    }, []);

    const filterAllergens = async (e, _id) => {
        const checked = { ...checkedAllergens };
        if (e.target.checked) {
            checked[_id] = true;
        } else {
            delete checked[_id];
        }

        let filter = {};
        if (Object.keys(checked).length > 0) {
            filter = {
                $or: [
                    { allergens: { $nin: Object.keys(checked) } },
                    { allergens: [] }
                ]
            };
        }

        const products = await getCategoryProducts({ slug, id: '', postBody: { PostBody: { filter } } });
        setCategoryProducts(products);

        setCheckedAllergens(checked);
    };

    const openBlock = () => {
        setOpen(!open);
    };

    return (
        <div className="div-block-allergenes">
            <div className="faq-question-wrap">
                <div className="lien_alergenes w-inline-block" onClick={openBlock}>
                    <h6 className="heading-6-center">
                        COCHEZ VOS ALLERGÈNES AFIN DE NE VOIR QUE LES PRODUITS QUE VOUS POUVEZ CONSOMMER
                    </h6>
                    <img src="/images/Plus.svg" alt="" className="plus" />
                </div>
                <div className={`faq-content${open ? ' faq-question-open' : ''}`}>
                    <div className="text-span-center">Passez obligatoirement une commande unique en cas d&apos;allergie afin que les produits soient isolés</div>
                    <div className="form-block w-form">
                        <form name="form-alergies" className="form alergies">
                            {
                                allergens.map((allergen) => {
                                    return (
                                        <label key={allergen._id} className="w-checkbox checkbox-field-allergene">
                                            <div className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene${checkedAllergens[allergen._id] ? ' w--redirected-checked' : ''}`} />
                                            <input 
                                                type="checkbox"
                                                style={{ opacity: 0, position: 'absolute', zIndex: -1 }} 
                                                checked={checkedAllergens[allergen._id] ? true : false}
                                                onChange={(e) => filterAllergens(e, allergen._id)}
                                            />
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