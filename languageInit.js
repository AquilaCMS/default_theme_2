const fs   = require('fs');
const path = require('path');

const setLanguage = (langs, defaultLanguage) => {
    const tabLangs       = langs.split(',');
    const themeName      = path.basename(__dirname);
    const pathToTheme    = path.join(global.aquila.appRoot, 'themes', themeName, '/');
    const i18nSamplePath = path.join(pathToTheme, 'i18n.js.sample');
    const i18nFilePath   = path.join(pathToTheme, 'i18n.js');

    const json         = require(i18nSamplePath);
    json.locales       = tabLangs; // Replace or create "locales" property
    json.defaultLocale = defaultLanguage; // Replace or create "defaultLocale" property
    
    // Process to retrieve each module folder
    const anyPages   = json.pages['*'];
    const moduleList = fs.readdirSync(path.join(pathToTheme, 'modules'), { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name);
    for (let i = 0; i < moduleList.length; i++) {
        const modulePath = `modules/${moduleList[i]}`;
        anyPages.push(modulePath);
    }
    json.pages['*'] = anyPages;

    const file = fs.readFileSync(i18nSamplePath);
    let res    = file.toString().replace(/locales[\s\t]*:.*/, `locales: ${JSON.stringify(json.locales)},`);
    res        = res.replace(/defaultLocale[\s\t]*:.*/, `defaultLocale: ${JSON.stringify(json.defaultLocale)},`);
    res        = res.replace(/pages[\s\t]*: {[^}]*/s, `pages: ${JSON.stringify(json.pages, null, 4).replace('}', '')}`);
    fs.writeFileSync(i18nFilePath, res);
    console.log('Language initialization completed');
    return;
};

module.exports = {
    setLanguage
};