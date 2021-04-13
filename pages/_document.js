import Document, { Html, Head, Main, NextScript } from 'next/document';
import Favicon                                    from '@components/layouts/Favicon';
import GTMScripts                                 from '@components/tools/GTMScripts';
import FbpScripts                                 from '@components/tools/FbpScripts';


const TMPlang = 'fr';
export default class MyDocument extends Document {
    render() {
        return (
            <Html lang={TMPlang}>
                <Head>
                    <GTMScripts script="header" />
                    <FbpScripts />

                    <link rel="preload" href="/fonts/Inter-Medium.woff" as="font" crossOrigin='anonymous'></link>
                    <link rel="preload" href="/fonts/Inter-SemiBold.woff" as="font" crossOrigin='anonymous'></link>
                    <link rel="preload" href="/fonts/Inter-Regular.woff" as="font" crossOrigin='anonymous'></link>
                    <link rel="preload" href="/fonts/Inter-Bold.woff" as="font" crossOrigin='anonymous'></link>

                    <Favicon />
                </Head>
                <body>
                    <GTMScripts script="body" />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
