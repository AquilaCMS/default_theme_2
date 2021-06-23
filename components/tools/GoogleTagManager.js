import { useEffect } from 'react';
import { useRouter } from 'next/router';
import cookie        from 'cookie';
import * as gtm      from '@lib/common/google-tag-manager/gtm';

const handleRouteChange = (url) => {
    gtm.pageview(url);
};

const GoogleTagManager = ({ children }) => {
    const router = useRouter();
    
    useEffect(() => {
        const cookieNotice = cookie.parse(document.cookie).cookie_notice;
        if (cookieNotice === true) {
            router.events.on('routeChangeComplete', handleRouteChange);
        }
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return children;
};

export default GoogleTagManager;