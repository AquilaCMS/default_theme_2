import { useEffect, useState } from 'react';
import cookie                  from 'cookie';

export default function CookiesBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const cookieNotice = cookie.parse(document.cookie).cookie_notice;
        if (cookieNotice === 'true') {
            setShow(false);
        } else {
            setShow(true);
        }
    }, []);

    const acceptCookie = () => {
        document.cookie = 'cookie_notice=true;';
        setShow(false);
    };

    if (show) {
        return (

            <div className="div-block-cookies">
                <blockquote className="block-quote-rgpd">Cookies<br />&amp;<br />RGPD</blockquote>
                <p className="paragraph-rgpd">
                    Nous utilisons des cookies. Vous pouvez configurer ou refuser les cookies dans votre navigateur. Vous pouvez aussi accepter tous les cookies en cliquant sur le bouton « Accepter tous les cookies ». Pour plus d’informations, vous pouvez consulter notre Politique de confidentialité et des cookies.<br />
                    <a href="#" className="link-rgpd">Lire notre Politique de confidentialité</a>
                </p>
                <a href="#" onClick={acceptCookie} className="button-white w-button">J&apos;accepte</a>
            </div>

        );
    }
    else {
        return null;
    }
}
