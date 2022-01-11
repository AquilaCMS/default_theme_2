const fs   = require('fs');
const path = require('path');

const setLanguage = (langs, defaultLanguage) => {
    const tabLangs       = langs.split(',');
    const themeName      = path.basename(__dirname);
    const pathToTheme    = path.join(global.appRoot, 'themes', themeName, '/');
    const i18nSamplePath = path.join(pathToTheme, 'i18n.json.sample');
    const i18nFilePath   = path.join(pathToTheme, 'i18n.json');

    const file         = fs.readFileSync(i18nSamplePath);
    let json           = JSON.parse(file); // Parse JSON file
    json.locales       = tabLangs; // Replace or create "locales" property
    json.defaultLocale = defaultLanguage; // Replace or create "defaultLocale" property
    let data           = JSON.stringify(json, null, 2);
    fs.writeFileSync(i18nFilePath, data);
    console.log('Language initialization completed');
    return;
};

module.exports = {
    setLanguage
};