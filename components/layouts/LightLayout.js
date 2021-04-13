
export default function LightLayout({ children }) {
    return (
        <>
            <div id="Navigation" data-collapse="medium" role="banner" className="navbar w-nav">
                <div className="navigation-container">
                    <div className="navigation-left">
                        <a href="/" aria-current="page" className="brand w-nav-brand w--current">
                            <img src="/images/monrestaurant-logo.jpg" alt="" />
                        </a>
                    </div>
                </div>
            </div>

            <main>{children}</main>

            <div className="footer">
                <div className="section-footer">
                    <div className="columns-3 w-row">
                        <div className="w-col w-col-2 w-col-medium-4">
                            <img src="/images/monrestaurant-logo.jpg" loading="lazy" alt="" />
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
