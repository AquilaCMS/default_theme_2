import { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as gtm      from '@lib/common/google-tag-manager/gtm';

const handleRouteChange = (url) => {
    gtm.pageview(url);
};

const GoogleTagManager = ({ children }) => {
    const router = useRouter();
    
    useEffect(() => {
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, []);

    return children;
};

export default GoogleTagManager;