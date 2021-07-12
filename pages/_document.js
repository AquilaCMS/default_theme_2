import Document, { Html, Head, Main, NextScript } from 'next/document';
import Cookies                                    from 'cookies';
import Favicon                                    from '@components/layouts/Favicon';
import GTMScripts                                 from '@components/tools/GTMScripts';
import FbpScripts                                 from '@components/tools/FbpScripts';
export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps          = await Document.getInitialProps(ctx);
        const cookiesServerInstance = new Cookies(ctx.req, ctx.res);
        return { ...initialProps, locale: ctx.locale, cookieNotice: cookiesServerInstance.get('cookie_notice') };
    }
      
    render() {
        return (
            <Html lang={this.props.locale}>
                <Head>
                    <GTMScripts cookieNotice={this.props.cookieNotice} script="header" />
                    <FbpScripts cookieNotice={this.props.cookieNotice} />

                    {/* Here because duplication problem in the ClickAndCollect component */}
                    <script src={'https://maps.googleapis.com/maps/api/js?key=AIzaSyC0ISY810uOtckysZpUrTEcrygh8crpd1w&libraries=places'} defer></script>
                    
                    <meta name="powered-by" content="AquilaCMS" />

                    <Favicon />
                </Head>
                <body>
                    <GTMScripts cookieNotice={this.props.cookieNotice} script="body" />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
