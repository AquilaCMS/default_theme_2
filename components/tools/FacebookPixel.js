import { useEffect } from 'react';
import Router        from 'next/router';
import * as fbq      from '@lib/common/fb-pixel/fpixel';

const handleRouteChange = () => {
    fbq.pageview();
};

const FacebookPixel = ({ children }) => {
    useEffect(() => {
        // This pageview only trigger first time (it is important for Pixel to have real information)
        fbq.pageview();
            
        Router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, []);

    return children;
};

export default FacebookPixel;