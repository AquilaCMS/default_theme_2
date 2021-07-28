
import absoluteUrl       from 'next-absolute-url';
import useTranslation    from 'next-translate/useTranslation';
import ErrorPage         from '@pages/_error';
import Layout            from '@components/layouts/Layout';
import NextSeoCustom     from '@components/tools/NextSeoCustom';
import BlockCMS          from '@components/common/BlockCMS';
import { dispatcher }    from '@lib/redux/dispatcher';
import { getPageStatic } from 'aquila-connector/api/static';
import { getBlocksCMS }  from 'aquila-connector/api/blockcms';
import { useStaticPage } from '@lib/hooks';
import { setLangAxios }  from '@lib/utils';
// import Breadcrumb   from '@components/navigation/Breadcrumb';

// voir pour le SSG
export async function getServerSideProps({ locale, params, req, res }) {
    setLangAxios(locale, req, res);

    const actions = [
        {
            type: 'PUSH_CMSBLOCKS',
            func: getBlocksCMS.bind(this, ['bottom-parallax'], locale)
        },
        {
            type: 'SET_STATICPAGE',
            func: getPageStatic.bind(this, params.staticSlug, locale)
        }
    ];

    const pageProps = await dispatcher(locale, req, res, actions);

    // URL origin
    const { origin }       = absoluteUrl(req);
    pageProps.props.origin = origin;

    return pageProps;
}

export default function StaticPage({ error, origin }) {
    const { lang }   = useTranslation();
    const staticPage = useStaticPage();

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
                image={`${process.env.NEXT_PUBLIC_IMG_URL}/medias/Logo.jpg`}
            />

            {/* <Breadcrumb /> */}{/*  The Breadcrumb sould be between the title and the text, but its not possible now */}
            
            <BlockCMS content={staticPage.content} />
            
            <BlockCMS nsCode="bottom-parallax" />
        </Layout>
    );
}
