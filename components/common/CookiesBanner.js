import { useEffect, useState } from 'react';
import useTranslation          from 'next-translate/useTranslation';
import cookie                  from 'cookie';
import { getBlockCMS }         from '@lib/aquila-connector/blockcms';

export default function CookiesBanner() {
    const { t }                   = useTranslation();
    const [show, setShow]         = useState(false);
    const [txtLegal, setTxtLegal] = useState(t('components/cookiesBanner:defaultTxt'));

    useEffect(() => {
        const cookieNotice = cookie.parse(document.cookie).cookie_notice;
        const fetchData    = async () => {
            const response = await getBlockCMS('CookiesBan');
            setTxtLegal(response.content);
        };
        if (cookieNotice === 'true') {
            setShow(false);
        } else {
            setShow(true);
            fetchData();
        }
    }, []);

    const acceptCookie = () => {
        document.cookie = 'cookie_notice=true; path=/;';
        setShow(false);
    };

    if (show) {
        return (

            <div className="div-block-cookies">
                <blockquote className="block-quote-rgpd">Cookies<br />&amp;<br />RGPD</blockquote>
                <p className="paragraph-rgpd" dangerouslySetInnerHTML={{ __html: txtLegal }}></p>
                <a href="#" onClick={acceptCookie} className="button-white w-button">{t('components/cookiesBanner:agree')}</a>
            </div>

        );
    }
    else {
        return null;
    }
}
