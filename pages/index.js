import absoluteUrl       from 'next-absolute-url';
import useTranslation    from 'next-translate/useTranslation';
import Layout            from '@components/layouts/Layout';
import NextSeoCustom     from '@components/tools/NextSeoCustom';
import BlockCMS          from '@components/common/BlockCMS';
import { dispatcher }    from '@lib/redux/dispatcher';
import { getPageStatic } from 'aquila-connector/api/static';
import { setLangAxios }  from '@lib/utils';

export async function getServerSideProps({ locale, req, res }) {
    setLangAxios(locale, req, res);

    let staticPage = {};
    try {
        staticPage = await getPageStatic('home', locale);
    } catch (err) {
        return { notFound: true };
    }

    const actions = [
        {
            type : 'SET_STATICPAGE',
            value: staticPage
        }
    ];

    const pageProps = await dispatcher(locale, req, res, actions);

    // URL origin
    const { origin }           = absoluteUrl(req);
    pageProps.props.origin     = origin;
    pageProps.props.staticPage = staticPage;

    return pageProps;
}

export default function Home({ origin, staticPage }) {
    const { lang } = useTranslation();

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
