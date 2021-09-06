const path           = require('path');
const next           = require('next').default;
const serverUtils    = require('../../utils/server');
const packageManager = require('../../utils/packageManager');
const dev            = serverUtils.dev;

const themeName   = path.basename(__dirname);
const pathToTheme = path.join(global.appRoot, 'themes', themeName, '/');

const start = async () => {
    if (global?.envConfig?.environment?.appUrl) {
        const appUrl                    = global.envConfig.environment.appUrl.slice(0, -1);
        process.env.NEXT_PUBLIC_API_URL = `${appUrl}/api`;
        process.env.NEXT_PUBLIC_IMG_URL = appUrl;
    }
    const app   = next({ dev, dir: pathToTheme });
    let handler = app.getRequestHandler();

    console.log('next build start...');
    await app.prepare();
    console.log('next build finish');
    return handler;
};


const build = async () => {
    await packageManager.execCmd('npx next build', pathToTheme);
};

module.exports = {
    start,
    build
};
