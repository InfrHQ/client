let appData = {
    discord: {
        vector_url:
            'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698352133/brand_vectors/discord_svg_ghnvqt.svg',
        color: '#7289da',
    },
    gmail: {
        vector_url: 'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698352133/brand_vectors/gmail_svg_sybydc.svg',
        color: '#c71610',
    },
    vscode: {
        vector_url: 'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698352134/brand_vectors/vscode_svg_zse4v2.svg',
        color: '#0078d7',
    },
    twitter_x: {
        vector_url: 'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698352134/brand_vectors/x_svg_nld67q.svg',
        color: '#000000',
    },
    reddit: {
        vector_url: 'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698352133/brand_vectors/reddit_svg_dhpgl9.svg',
        color: '#ED001C',
    },
    openai: {
        vector_url:
            'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698352133/brand_vectors/chatgpt_svg_ebnnrc.svg',
        color: '#00A67E',
    },
    slack: {
        vector_url: 'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698352134/brand_vectors/slack_svg_md9ywq.svg',
        color: '#36C5F0',
    },
    google_chrome: {
        vector_url: 'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698352133/brand_vectors/chrome_svg_bjzboc.svg',
        color: '#de5246',
    },
    spotify: {
        vector_url:
            'https://res.cloudinary.com/dcwz20wdd/image/upload/v1698353195/brand_vectors/spotify_svg_hm5wma.svg',
        color: '#1DB954',
    },
    infr: {
        vector_url: '/infr.png',
        color: '#8c52ff',
    },
};

function getAppColorAndIcon(image) {
    let appName = image?.attributes?.app_name;
    if (!appName) {
        return appData['infr'];
    }

    // Handle app names
    if (appName == 'Google Chrome') {
        appName = 'google_chrome';

        let url = image?.attributes?.url;
        if (!url) {
            return appData['google_chrome'];
        }

        // Handle  websites
        if (url.includes('twitter') || url.includes('x.com')) {
            appName = 'twitter_x';
        }
        if (url.includes('reddit')) {
            appName = 'reddit';
        }
        if (url.includes('gmail')) {
            appName = 'gmail';
        }
        if (url.includes('discord')) {
            appName = 'discord';
        }
        if (url.includes('openai')) {
            appName = 'openai';
        }
        if (url.includes('slack')) {
            appName = 'slack';
        }
        if (url.includes('spotify')) {
            appName = 'spotify';
        }
    }
    if (appName == 'Twitter' || appName == 'X') {
        appName = 'twitter_x';
    }
    if (appName == 'Reddit') {
        appName = 'reddit';
    }
    if (appName == 'Gmail') {
        appName = 'gmail';
    }
    if (appName == 'Discord') {
        appName = 'discord';
    }
    if (appName == 'OpenAI') {
        appName = 'openai';
    }
    if (appName == 'Slack') {
        appName = 'slack';
    }
    if (appName == 'Spotify') {
        appName = 'spotify';
    }
    if (appName == 'Visual Studio Code') {
        appName = 'vscode';
    }

    // if exists return
    if (Object.prototype.hasOwnProperty.call(appData, appName)) {
        return appData[appName];
    }
    return appData['infr'];
}

export { appData, getAppColorAndIcon };
