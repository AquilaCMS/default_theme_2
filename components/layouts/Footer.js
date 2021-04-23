// import { useSelector } from 'react-redux';
import Newsletter from '@components/common/Newsletter';
import FooterMenu from '@components/navigation/FooterMenu';

// const getDatas = () => {
//     const siteConfig = useSelector((state) => state.siteConfig);
//     return { siteConfig };
// };

export default function Footer() {

    // const { siteConfig } = getDatas();
    const siteName = 'TODO';

    return (

        <div className="footer">
            <Newsletter />

            <div className="section-footer">
                <div className="columns-3 w-row">
                    <div className="w-col w-col-2 w-col-medium-4">
                        <img src={`${process.env.NEXT_PUBLIC_IMG_URL}/medias/Logo.jpg`} loading="lazy" alt={siteName} />
                    </div>
                    <div className="w-col w-col-2 w-col-medium-4" />

                    <FooterMenu />

                    <div className="w-col w-col-2 w-col-medium-4">
                        <div className="social-icon-wrap">
                            <a href="https://www.instagram.com" className="social-link w-inline-block" target="_blank" rel="noreferrer" ><img src="/images/social-instagram.svg" alt="Instagram" className="social-icon" /></a>
                            <a href="https://fr-fr.facebook.com" className="social-link w-inline-block" target="_blank" rel="noreferrer"><img src="/images/social-twitter.svg" alt="Twitter" className="social-icon" /></a>
                            <a href="https://www.youtube.com" className="social-link w-inline-block" target="_blank" rel="noreferrer"><img src="/images/social-youtube.svg" alt="Youtube" className="social-icon" /></a>
                        </div>
                    </div>

                </div>
            </div>

            <div className="footer-legal">
                <p className="paragraph-2">Powered by <a href="https://www.aquila-cms.com/" target="_blank" rel="noreferrer">AquilaCMS</a></p>
            </div>
        </div>

    );
}
