
import Header        from '@components/layouts/Header';
import Footer        from '@components/layouts/Footer';
import CookiesBanner from '@components/common/CookiesBanner';
import BlockCMS      from '@components/common/BlockCMS';
import Languages     from '@components/common/Languages';

export default function Layout({ children }) {
    return (
        <>
            <BlockCMS nsCode="top-banner" />

            <Languages />

            <Header />

            <main>{children}</main>

            <Footer />

            <CookiesBanner />
        </>
    );
}
