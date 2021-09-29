const fs = require('fs');

const setLanguage = (defaultLanguage, langs = ['fr']) => {
    const file         = fs.readFileSync('i18n.json.sample');
    let json           = JSON.parse(file); // Parse JSON file
    json.locales       = langs; // Replace or create "locales" property
    json.defaultLocale = defaultLanguage; // Replace or create "defaultLocale" property
    let data           = JSON.stringify(json, null, 2);
    fs.writeFileSync('i18n.json', data);
};

module.exports = {
    setLanguage
};