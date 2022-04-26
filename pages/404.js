import Head           from 'next/head';
import Link           from 'next/link';
import Layout         from '@components/layouts/Layout';
import useTranslation from 'next-translate/useTranslation';
import { dispatcher } from '@lib/redux/dispatcher';

export async function getStaticProps({ locale }) {
    const pageProps = await dispatcher(locale);
    return pageProps;
}

export default function Custom404() {
    const { t } = useTranslation();

    return (
        <Layout>
            <Head>
                <title>{t('pages/error:title404')}</title>
            </Head>
            <div className="utility-page-wrap-2">
                <div className="container flex-vertical">
                    <h2>{t('pages/error:title404')}</h2>
                    <div>
                        <p className="utility-paragraph">
                            {t('pages/error:text404')}<br />
                            <Link href="/">
                                <a className="link-2">{t('pages/error:back')}</a>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}