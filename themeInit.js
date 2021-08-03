const fs = require('fs');
const path = require('path');
const next = require('next').default;
const express = require('express');
const nextBuild = require('next/dist/build').default;
const serverUtils = require('../../utils/server')
const dev = !serverUtils.isProd;

const themeName = path.basename(__dirname);
const pathToTheme = path.join(global.appRoot, "themes", themeName, "/");

const start = async (server) => {
    const app = next({ dev, dir: pathToTheme });
    let handler = app.getRequestHandler();

    console.log('next build start...');
    await app.prepare();
    console.log('next build finish');
    return handler;
}


const build = async () => {
    // do yarn if you want using ../../utils/themes
    await nextBuild(pathToTheme);
}

module.exports = {
    start,
    build
};