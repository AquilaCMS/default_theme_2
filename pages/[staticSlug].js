import useTranslation   from 'next-translate/useTranslation';
import { useSelector }  from 'react-redux';
import ErrorPage        from '@pages/_error';
import Layout           from '@components/layouts/Layout';
import NextSeoCustom    from '@components/tools/NextSeoCustom';
import BlockCMS         from '@components/common/BlockCMS';
import { dispatcher }   from '@lib/redux/dispatcher';
import staticProvider   from '@lib/aquila-connector/static';
import blockCMSProvider from '@lib/aquila-connector/blockcms';
// import Breadcrumb   from '@components/navigation/Breadcrumb';

const getStoreData = () => {
    const staticPage = useSelector((state) => state.staticPage);
    return { staticPage };
};


// voir pour le SSG
export async function getServerSideProps({ params, req, res }) {
    const actions = [
        {
            type: 'PUSH_CMSBLOCKS',
            func: blockCMSProvider.getBlocksCMS.bind(this, ['bottom-parallax'])
        },
        {
            type: 'SET_STATICPAGE',
            func: staticProvider.getPageStatic.bind(this, params.staticSlug)
        }
    ];

    return dispatcher(req, res, actions);
}


export default function StatisPage({ error }) {
    const { lang }       = useTranslation();
    const { staticPage } = getStoreData();

    if (error || !staticPage._id) {
        return (<ErrorPage statusCode={404} />);
    }


    return (
        <Layout>

            {/* <Breadcrumb /> */}{/*  The Breadcrumb sould be between the title and the text, but its not possible now */}
            
            <div dangerouslySetInnerHTML={{ __html: staticPage.content }} />
            
            <BlockCMS nsCode="bottom-parallax" />


            <NextSeoCustom
                title={staticPage.title}
                description={staticPage.metaDesc}
                canonical={`/${staticPage.slug[lang]}`}
                lang={lang}
                image='/images/monrestaurant-logo.jpg'
            />


        </Layout>
    );
}
