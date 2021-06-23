import { useEffect } from 'react';
import { useRouter } from 'next/router';
import cookie        from 'cookie';
import * as fbq      from '@lib/common/fb-pixel/fpixel';

const handleRouteChange = () => {
    fbq.pageview();
};

const FacebookPixel = ({ children }) => {
    const router = useRouter();

    useEffect(() => {
        const cookieNotice = cookie.parse(document.cookie).cookie_notice;
        if (cookieNotice === true) {
            // This pageview only trigger first time (it is important for Pixel to have real information)
            fbq.pageview();
        
            router.events.on('routeChangeComplete', handleRouteChange);
        }
        
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return children;
};

export default FacebookPixel;