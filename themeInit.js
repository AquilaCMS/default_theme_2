const path        = require('path');
const fs          = require('fs');
const next        = require('next').default;
const serverUtils = require('../../utils/server');
const { execCmd } = require('aql-utils');
const dev         = serverUtils.dev;

const themeName = path.basename(__dirname);

if (global.aquila && typeof global.aquila !== 'object') global.aquila = JSON.parse(Buffer.from(global.aquila, 'base64').toString('utf8'));

const pathToTheme = path.join(global.aquila.appRoot, 'themes', themeName, '/');

const start = async () => {
    const app   = next({ dev, dir: pathToTheme });
    let handler = app.getRequestHandler();

    createCustomCSSIfNotExists();
    createListModulesIfNotExists();
    
    console.log('next build start...');
    await app.prepare();
    console.log('next build finish');
    return handler;
};


const build = async () => {
    createDotEnvIfNotExists();
    createCustomCSSIfNotExists();
    createListModulesIfNotExists();
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
    if (global?.aquila?.envConfig) {
        appUrl = global.aquila.envConfig.environment.appUrl.slice(0, -1);
    }
    const nextApiValue              = `${appUrl}/api`;
    process.env.NEXT_PUBLIC_API_URL = nextApiValue;
    const data                      = `NEXT_PUBLIC_API_URL=${nextApiValue}`;
    const dotEnvPath                = path.join(pathToTheme, '.env');
    if (!fs.existsSync(dotEnvPath)) {
        fs.writeFileSync(dotEnvPath, data);
    }
};

const createListModulesIfNotExists = async () => { // 
    console.log('createListModulesIfNotExists');
    // Create folder "modules" if not exists
    const modulesPath = path.join(pathToTheme, 'modules');
    if (!fs.existsSync(modulesPath)) {
        fs.mkdirSync(modulesPath);
    }
    // Create file if not exists
    const listModulePath = path.join(pathToTheme, 'modules', 'list_modules.js');
    if (!fs.existsSync(listModulePath)) {
        fs.writeFileSync(listModulePath, 'export default [];');
    }
};

module.exports = {
    start,
    build
};
