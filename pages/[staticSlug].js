import absoluteUrl       from 'next-absolute-url';
import useTranslation    from 'next-translate/useTranslation';
import ErrorPage         from '@pages/_error';
import Layout            from '@components/layouts/Layout';
import NextSeoCustom     from '@components/tools/NextSeoCustom';
import BlockCMS          from '@components/common/BlockCMS';
import { dispatcher }    from '@lib/redux/dispatcher';
import { getPageStatic } from '@aquilacms/aquila-connector/api/static';
import { getBlocksCMS }  from '@aquilacms/aquila-connector/api/blockcms';
import { useStaticPage } from '@lib/hooks';
import { setLangAxios }  from '@lib/utils';
// import Breadcrumb   from '@components/navigation/Breadcrumb';

// voir pour le SSG
export async function getServerSideProps({ locale, params, query, req, res }) {
    setLangAxios(locale, req, res);

    let staticPage = {};
    try {
        staticPage = await getPageStatic(params.staticSlug, query.preview, locale);
    } catch (err) {
        return { notFound: true };
    }

    // Get URLs for language change
    const urlsLanguages = [];
    if (staticPage) {
        for (const [lang, sl] of Object.entries(staticPage.slug)) {
            urlsLanguages.push({ lang, url: `/${sl}` });
        }
    }

    const actions = [
        {
            type: 'PUSH_CMSBLOCKS',
            func: getBlocksCMS.bind(this, ['bottom-parallax'], locale)
        }, {
            type : 'SET_STATICPAGE',
            value: staticPage
        }, {
            type : 'SET_URLS_LANGUAGES',
            value: urlsLanguages
        }
    ];

    const pageProps = await dispatcher(locale, req, res, actions);

    // URL origin
    const { origin }       = absoluteUrl(req);
    pageProps.props.origin = origin;
    return pageProps;
}

export default function StaticPage({ error, origin }) {
    const { staticPage } = useStaticPage();
    const { lang }       = useTranslation();

    if (error || !staticPage._id) {
        return (<ErrorPage statusCode={404} />);
    }


    return (
        <Layout>
            <NextSeoCustom
                title={staticPage.title}
                description={staticPage.metaDesc}
                canonical={`${origin}/${staticPage.slug[lang]}`}
                lang={lang}
                image={`${origin}/images/medias/max-100/605363104b9ac91f54fcabac/Logo.jpg`}
            />

            {/* <Breadcrumb /> */}{/*  The Breadcrumb sould be between the title and the text, but its not possible now */}
            
            <BlockCMS content={staticPage.content} />
            
            <BlockCMS nsCode="bottom-parallax" />
        </Layout>
    );
}
