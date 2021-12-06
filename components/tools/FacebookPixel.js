import { useEffect } from 'react';
import { useRouter } from 'next/router';
import cookie        from 'cookie';
import * as fbq      from '@lib/common/fb-pixel/fpixel';

const FacebookPixel = ({ children }) => {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (url) => {
            fbq.pageview(url);
        };

        const cookieNotice = cookie.parse(document.cookie).cookie_notice;
        if (cookieNotice === 'true') {
            // This pageview only trigger first time (it is important for Pixel to have real information)
            fbq.pageview(router.asPath);
            router.events.on('routeChangeComplete', handleRouteChange);
        }
        
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.event]);

    return children;
};

export default FacebookPixel;