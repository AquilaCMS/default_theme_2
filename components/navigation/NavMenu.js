import { Fragment, useState } from 'react';
import { useRouter }          from 'next/router';
import useTranslation         from 'next-translate/useTranslation';
import Link                   from 'next/link';
import { useNavMenu }         from '@lib/hooks';
import { isMobile }           from '@lib/utils';

export default function NavMenu() {
    const [burger, setBurger]                   = useState(false);
    const [view, setView]                       = useState([]);
    const [boolOpenSubMenu, setBoolOpenSubMenu] = useState(false);
    const navMenu                               = useNavMenu();
    const { asPath }                            = useRouter();
    const { lang, t }                           = useTranslation();

    const toggleBurger = () => {
        setBurger(!burger);
    };

    const openSubMenu = (id, level) => {
        if (!isMobile()) {
            let array = [...view];
            if (level === 1 && boolOpenSubMenu) {
                array = [];
            }
            array.push(id);
            setView(array);
            if (level === 1) {
                setBoolOpenSubMenu(true);
            }
        }
    };

    const openSubMenuOnClick = (id) => {
        let array   = [...view];
        const index = view.findIndex((i) => i === id);
        if (index > -1) {
            array.splice(index, 1);
        } else {
            array.push(id);
        }
        setView(array);
    };

    const closeSubMenu = () => {
        setView([]);
        setBoolOpenSubMenu(false);
    };

    return (
        <>
            <div className="menu-button w-nav-button" onClick={toggleBurger}>
                <div className="icon w-icon-nav-menu" />
            </div>

            <nav className={`nav-menu w-nav-menu${burger ? ' w-nav-button-open' : ''}`}>
                {navMenu ? navMenu.children?.map((item) => {
                    let current = false;
                    if ((item.action === 'catalog' && asPath.indexOf(`/c/${item.slug[lang]}`) > -1) || asPath.indexOf(`/${item.pageSlug}`) > -1) {
                        current = true;
                    }
                    return (
                        item.children && item.children.length > 0 ? (
                            <div className="nav-link-2 pd w-dropdown" onMouseEnter={() => openSubMenu(item._id, 1)} onMouseLeave={closeSubMenu} key={item._id}>
                                <div className={`dropdown-pd-toggle w-dropdown-toggle${view.find((v) => v === item._id) ? ' w--open' : ''}`} onClick={() => openSubMenuOnClick(item._id, 1)} >
                                    <div style={current ? { color: '#ff8946' } : {} }>{item.name}</div>
                                    <div className="w-icon-dropdown-toggle" />
                                </div>
                                <nav className={`dropdown-pd-list w-clearfix w-dropdown-list${view.find((v) => v === item._id) ? ' w--open' : ''}`}>
                                    <div className="page1">
                                        {
                                            item.children?.map((item2) => {
                                                return (
                                                    item2.children && item2.children.length > 0 ? (
                                                        <Fragment key={item2._id}>
                                                            <div className="link-to-page" onClick={() => openSubMenuOnClick(item2._id, 2)}>
                                                                <div className="text-block-nav">{item2.name}</div>
                                                                <div className="arrow2 w-icon-dropdown-toggle" />
                                                            </div>
                                                            <div className={`page-2${view.find((v) => v === item2._id) ? 'page-2-open' : ''}`}>
                                                                {
                                                                    item2.children?.map((item3) => {
                                                                        return (
                                                                            <div className="dropdown-nav-link-2" key={item3._id}>
                                                                                <div className="icon-3 w-icon-dropdown-toggle" />
                                                                                <Link href={item3.action === 'catalog' ? `/c/${item.slug[lang]}/${item2.slug[lang]}/${item3.slug[lang]}` : (item3.action === 'page' ? `/${item3.pageSlug}` : item3.url)}>
                                                                                    <a className="dropdown-link-3 w-dropdown-link">{item3.name}</a>
                                                                                </Link>
                                                                            </div>
                                                                        );
                                                                    })
                                                                }
                                                            </div>
                                                        </Fragment>
                                                    ) : (
                                                        <Link href={item2.action === 'catalog' ? `/c/${item.slug[lang]}/${item2.slug[lang]}` : (item2.action === 'page' ? `/${item2.pageSlug}` : item2.url)} key={item2._id}>
                                                            <a className="dropdown-nav-link w-dropdown-link">{item2.name}</a>
                                                        </Link>
                                                    )
                                                );
                                            })
                                        }
                                    </div>
                                </nav>
                            </div>
                        ) : (
                            <Link href={item.action === 'catalog' ? `/c/${item.slug[lang]}` : (item.action === 'page' ? `/${item.pageSlug}` : item.url)} key={item._id}>
                                <a className={`nav-link-2 w-nav-link${current ? ' w--current' : ''}`} >{item.name}</a>
                            </Link>
                        )
                    );
                }) : null}

                <Link href="/account/login">
                    <a className={`nav-link-2 w-nav-link${asPath.indexOf('/account') > -1 ? ' w--current' : ''}`}>{t('components/navigation:myAccount')}</a>
                </Link>
            </nav>
        </>
    );
}
