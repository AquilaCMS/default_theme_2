
import Header        from '@components/layouts/Header';
import Footer        from '@components/layouts/Footer';
import CookiesBanner from '@components/common/CookiesBanner';
import BlockCMS      from '@components/common/BlockCMS';

export default function Layout({ children }) {
    return (
        <>

            <BlockCMS nsCode="top-banner" />

            <Header />

            <main>{children}</main>

            <Footer />
            <CookiesBanner />

        </>
    );
}
