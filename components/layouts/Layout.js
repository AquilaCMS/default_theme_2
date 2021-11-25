import Head             from 'next/head';
import parse            from 'html-react-parser';
import Header           from '@components/layouts/Header';
import Footer           from '@components/layouts/Footer';
import CookiesBanner    from '@components/common/CookiesBanner';
import BlockCMS         from '@components/common/BlockCMS';
import Languages        from '@components/common/Languages';
import SearchBar        from '@components/common/SearchBar';
import { useCmsBlocks } from '@lib/hooks';

export default function Layout({ children }) {
    const cmsBlocks    = useCmsBlocks();
    const cmsBlockHead = cmsBlocks.find((b) => b.code === 'head'); // Getting CMS block "Head"

    return (
        <>
            <Head>
                {cmsBlockHead && cmsBlockHead.content ? parse(cmsBlockHead.content) : null}
            </Head>

            <BlockCMS nsCode="top-banner" />

            <SearchBar />

            <Languages />

            <Header />

            <main>{children}</main>

            <Footer />

            <CookiesBanner />
        </>
    );
}
