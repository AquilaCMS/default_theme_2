import absoluteUrl       from 'next-absolute-url';
import useTranslation    from 'next-translate/useTranslation';
import Layout            from '@components/layouts/Layout';
import NextSeoCustom     from '@components/tools/NextSeoCustom';
import BlockSlider       from '@components/common/BlockSlider';
import BlockCMS          from '@components/common/BlockCMS';
import { dispatcher }    from '@lib/redux/dispatcher';
import { getBlocksCMS }  from '@lib/aquila-connector/blockcms/index';
import { getPageStatic } from '@lib/aquila-connector/static';
import { useStaticPage } from '@lib/hooks';

const getDataBlocksCMS = async () => {
    const blockCMSCode = [
        'Slide-Home-1',
        'Slide-Home-2',
        'Slide-Home-3',
    ];
    return getBlocksCMS(blockCMSCode);
};

export async function getServerSideProps({ req, res }) {
    const actions = [
        {
            type: 'PUSH_CMSBLOCKS',
            func: getDataBlocksCMS.bind(this)
        },
        {
            type: 'SET_STATICPAGE',
            func: getPageStatic.bind(this, 'home')
        }
    ];

    const pageProps = await dispatcher(req, res, actions);

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

            <BlockSlider nsCodeList={['Slide-Home-1', 'Slide-Home-2', 'Slide-Home-3']} />

            <BlockCMS content={staticPage.content} />
        </Layout>
    );
}
