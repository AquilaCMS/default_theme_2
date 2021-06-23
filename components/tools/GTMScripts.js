import { GTM_ID } from '@lib/common/google-tag-manager/gtm';

export default function GTMScripts({ cookieNotice, script }) {
    if (!GTM_ID || !cookieNotice || cookieNotice === 'deny') return null;

    if (script === 'header') {
        return (
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer', '${GTM_ID}');
              `,
                }}
            />
        );
    }
    else if (script === 'body') {
        return (
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                />
            </noscript>
        );
    }
    return null;
}