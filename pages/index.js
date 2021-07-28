import absoluteUrl       from 'next-absolute-url';
import useTranslation    from 'next-translate/useTranslation';
import Layout            from '@components/layouts/Layout';
import NextSeoCustom     from '@components/tools/NextSeoCustom';
import BlockCMS          from '@components/common/BlockCMS';
import { dispatcher }    from '@lib/redux/dispatcher';
import { getPageStatic } from 'aquila-connector/api/static';
import { useStaticPage } from '@lib/hooks';
import { setLangAxios }  from '@lib/utils';

export async function getServerSideProps({ locale, req, res }) {
    setLangAxios(locale, req, res);
    
    const actions = [
        {
            type: 'SET_STATICPAGE',
            func: getPageStatic.bind(this, 'home', locale)
        }
    ];

    const pageProps = await dispatcher(locale, req, res, actions);

    // URL origin
    const { origin }       = absoluteUrl(req);
    pageProps.props.origin = origin;

    return pageProps;
}

export default function Home({ origin }) {
    const { lang }   = useTranslation();
    const staticPage = useStaticPage();

    return (
        <Layout>
            <NextSeoCustom
                title={staticPage.title}
                description={staticPage.metaDesc}
                canonical={origin}
                lang={lang}
                image={`${process.env.NEXT_PUBLIC_IMG_URL}/medias/Logo.jpg`}
            />

            <BlockCMS content={staticPage.content} />
        </Layout>
    );
}
