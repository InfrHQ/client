async function makeServerCall(path, method, info) {

    let localData = JSON.parse(localStorage.getItem('server_credentials'))
    let thisServerHost = localData.host
    let thisApiKey = localData.api_key

    let url = `${thisServerHost}/${path}`;

    let requestInit = {
        method: method,
        headers: {
            'Infr-API-Key': thisApiKey,
        },
    };

    if (method === 'POST' || method === 'PUT') {
        requestInit.headers['Content-Type'] = 'application/json';
        requestInit.body = JSON.stringify(info);
    }

    let response = await fetch(url, requestInit);
    return response;
}

function strToBase64(query) {
    return btoa(query);
}

export { makeServerCall, strToBase64 };
