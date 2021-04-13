import { useState }    from 'react';
import { useSelector } from 'react-redux';

const getDatas = () => {
    const navMenu = useSelector((state) => state.navMenu);
    return { navMenu };
};

export default function MenuCategories() {

    const [open, setOpen] = useState(false);
    const openBlock       = () => {
        setOpen(!open);
    };

    const { navMenu : menuCat } = getDatas();

    return (
        <>
            <div className="lien_carte w-inline-block" onClick={openBlock}>
                <h6 className="heading-bouton-carte">Voir la suite de la carte</h6>
                <img src="/images/Plus.svg" alt="" className="plus-2" />
            </div>

            <div className={`tab-menu-round w-tab-menu${open ? ' tab-menu-round-open' : ''}`}>

                {menuCat?.children?.map((item) => {
                    return (
                    /* <a className="tab-link-round w-inline-block w-tab-link w--current" key={item._id}>
                                <div>{item.name}</div>
                            </a> */
                        item.children?.map((itemChild) => {
                            return (
                                <a className="tab-link-round w-inline-block w-tab-link" key={itemChild._id}>
                                    <div>{itemChild.name}</div>
                                </a>
                            );
                        })
                    );
                })}
                
            </div>
        </>
    );
}
