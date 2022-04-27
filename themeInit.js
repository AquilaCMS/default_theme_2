const path        = require('path');
const fs          = require('fs');
const next        = require('next').default;
const serverUtils = require('../../utils/server');
const { execCmd } = require('aql-utils');
const dev         = serverUtils.dev;

const themeName   = path.basename(__dirname);
const pathToTheme = path.join(global.appRoot, 'themes', themeName, '/');

const start = async () => {
    const app   = next({ dev, dir: pathToTheme });
    let handler = app.getRequestHandler();

    createCustomCSSIfNotExists();
    
    console.log('next build start...');
    await app.prepare();
    console.log('next build finish');
    return handler;
};


const build = async () => {
    createDotEnvIfNotExists();
    createCustomCSSIfNotExists();
    await execCmd('npx next build', pathToTheme);
};

const createCustomCSSIfNotExists = () => {
    console.log('createCustomCSSIfNotExists');
    // Create file if not exists
    const customCssPath = path.join(pathToTheme, 'styles', 'custom.css');
    if (!fs.existsSync(customCssPath)) {
        fs.writeFileSync(customCssPath, '');
    }
};

const createDotEnvIfNotExists = () => {
    console.log('createDotEnvIfNotExists');
    let appUrl = 'http://localhost:3010';
    if (global?.envConfig) {
        const globalEnvConfig = global.envConfig.replace(/#/g, '"');
        global.envConfig      = JSON.parse(globalEnvConfig);
        appUrl                = global.envConfig.environment.appUrl.slice(0, -1);
    }
    const nextApiValue              = `${appUrl}/api`;
    process.env.NEXT_PUBLIC_API_URL = nextApiValue;
    const data                      = `NEXT_PUBLIC_API_URL=${nextApiValue}`;
    const dotEnvPath                = path.join(pathToTheme, '.env');
    if (!fs.existsSync(dotEnvPath)) {
        fs.writeFileSync(dotEnvPath, data);
    }
};

module.exports = {
    start,
    build
};
