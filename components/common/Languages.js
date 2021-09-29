import Link                                from 'next/link';
import useTranslation                      from 'next-translate/useTranslation';
import setLanguage                         from 'next-translate/setLanguage';
import { useSiteConfig, useUrlsLanguages } from '@lib/hooks';

export default function Languages() {
    const { langs } = useSiteConfig();
    const urls      = useUrlsLanguages();
    const { lang }  = useTranslation();

    return (
        <div className="div-block-lang">
            {
                langs?.map((lng) => {
                    if (lng.code === lang) {
                        return <span className={`link-lang${lang === lng.code ? ' selected' : ''}`} key={lng.code}>{lng.code.toUpperCase()}</span>;
                    }
                    if (!urls.length) {
                        return (
                            <button type="button" className={`link-lang${lang === lng.code ? ' selected' : ''}`} key={lng.code} onClick={async () => await setLanguage(lng.code)}>{lng.code.toUpperCase()}</button>
                        );
                    }
                    return (
                        <Link href={urls.find(u => u.lang === lng.code)?.url || '/'} locale={lng.code} key={lng.code}>
                            <a className={`link-lang${lang === lng.code ? ' selected' : ''}`}>{lng.code.toUpperCase()}</a>
                        </Link>
                    );
                })
            }
        </div>
    );
}