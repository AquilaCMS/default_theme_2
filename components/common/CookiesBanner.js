import { useEffect, useState } from 'react';
import cookie                  from 'cookie';
import { getBlockCMS }         from '@lib/aquila-connector/blockcms';

export default function CookiesBanner() {
    const [show, setShow]         = useState(false);
    const [txtLegal, setTxtLegal] = useState('Nous utilisons des cookies. Vous pouvez configurer ou refuser les cookies dans votre navigateur. Vous pouvez aussi accepter tous les cookies en cliquant sur le bouton « Accepter tous les cookies ». Pour plus d’informations, vous pouvez consulter notre Politique de confidentialité et des cookies.');

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
                <a href="#" onClick={acceptCookie} className="button-white w-button">J&apos;accepte</a>
            </div>

        );
    }
    else {
        return null;
    }
}
