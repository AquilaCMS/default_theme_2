import { useState }   from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useNavMenu } from '@lib/hooks';

export default function MenuCategories() {
    const [open, setOpen] = useState(false);
    const navMenu         = useNavMenu();
    const { t }           = useTranslation();

    const openBlock = () => {
        setOpen(!open);
    };

    const menuCat = navMenu?.children?.filter((item) => item.action === 'catalog');

    if (menuCat?.length > 0) {
        return (
            <>
                <div className="lien_carte w-inline-block" onClick={openBlock}>
                    <h6 className="heading-bouton-carte">{t('components/navigation:viewMore')}</h6>
                    <img src="/images/Plus.svg" alt="" className="plus-2" />
                </div>

                <div className={`tab-menu-round w-tab-menu${open ? ' tab-menu-round-open' : ''}`}>

                    {menuCat?.map((item) => {
                        return (
                        /* <a className="tab-link-round w-inline-block w-tab-link w--current" key={item._id}>
                                <div>{item.name}</div>
                            </a> */
                            <a className="tab-link-round w-inline-block w-tab-link" key={item._id}>
                                <div>{item.name}</div>
                            </a>
                        );
                    })}
                
                </div>
            </>
        );
    }
    else
        return null;
}
