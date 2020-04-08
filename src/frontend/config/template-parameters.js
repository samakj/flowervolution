const themeColor = '#000000';
const webAppCapable = 'no';
const webAppTitle = 'Flowervolution';
const startUrl = '/';

module.exports = {
    defaultTitle: 'Flowervolution - The evolution game with flowers.',
    gameMountId: 'game-root',
    charset: 'utf-8',
    viewport: 'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no',
    description: 'Can you set up a thriving ecosystem or will your flowers wither and die.',
    androidMeta: {
        themeColor,
        androidMeta: webAppCapable,
    },
    iOSMeta: {
        mobileWebAppTitle: webAppTitle,
        mobileWebAppCapable: webAppCapable,
        mobileWebAppStatusBarStyle: themeColor,
    },
    windowsMeta: {
        navbuttonColor: themeColor,
        tileColor: themeColor,
        tileImage: '',
        config: '',
    },
    pinnedSitesMeta: {
        applicationName: webAppTitle,
        toolTip: webAppTitle,
        startUrl: startUrl,
    },
};
