import useTranslation from 'next-translate/useTranslation';
import setLanguage    from 'next-translate/setLanguage';

export default function Languages() {
    const { lang } = useTranslation();

    return (
        <div className="div-block-lang">
            <button type="button" className={`link-lang${lang === 'fr' ? ' selected' : ''}`} onClick={async () => await setLanguage('fr')}>FR</button>
            &nbsp;|&nbsp;
            <button type="button" className={`link-lang${lang === 'en' ? ' selected' : ''}`} onClick={async () => await setLanguage('en')}>EN</button>
        </div>
    );
}
