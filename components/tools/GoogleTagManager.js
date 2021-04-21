import { useEffect } from 'react';
import Router        from 'next/router';
import * as gtm      from '@lib/common/google-tag-manager/gtm';

const handleRouteChange = (url) => {
    gtm.pageview(url);
};

const GoogleTagManager = ({ children }) => {
    useEffect(() => {
        Router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, []);

    return children;
};

export default GoogleTagManager;