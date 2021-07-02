import Link              from 'next/link';
import { useSiteConfig } from '@lib/hooks';

export default function LightLayout({ children }) {
    const { environment } = useSiteConfig();

    return (
        <>
            <div id="Navigation" data-collapse="medium" role="banner" className="navbar w-nav">
                <div className="navigation-container">
                    <div className="navigation-left">
                        <Link href='/'>
                            <a aria-current="page" className="brand w-nav-brand w--current">
                                <img src={`${process.env.NEXT_PUBLIC_IMG_URL}/medias/Logo.jpg`} alt={environment?.siteName} />
                            </a>
                        </Link>
                    </div>
                </div>
            </div>

            <main>{children}</main>

            <div className="footer">
                <div className="section-footer">
                    <div className="columns-3 w-row">
                        <div className="w-col w-col-2 w-col-medium-4">
                            <img src={`${process.env.NEXT_PUBLIC_IMG_URL}/medias/Logo.jpg`} loading="lazy" alt={environment?.siteName} />
                        </div>
                        <div className="w-col w-col-2 w-col-medium-8" />
                    </div>
                </div>
                <div className="footer-legal">
                    <p className="paragraph-2">Powered by <a href="https://www.aquila-cms.com/" target="_blank" rel="noreferrer">AquilaCMS</a></p>
                </div>
            </div>
        </>
    );
}
