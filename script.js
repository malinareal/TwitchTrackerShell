document.addEventListener('DOMContentLoaded', async () => {
    const clientId = 'your id';
    const clientSecret = 'your secret ';
    const usernames = [
        'IzakOOO', 'YoungMulti', 'Xayoo_', 'EWROON', 'ZONY', 'PAGO3', 'Kasix',
        'Mandzio', 'Nervarien', 'MrDzinold', 'isamu', 'xmerghani', 'parisplatynov',
        'Jacob4TV', 'Japczan', 'BanduraCartel', 'Popo', 'remsua', 'Kubx', 'Franio'
    ];

    async function getAccessToken() {
        const authUrl = 'https://id.twitch.tv/oauth2/token';
        const response = await fetch(authUrl, {
            method: 'POST',
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            })
        });
        const data = await response.json();
        return data.access_token;
    }

    async function getStreamInfo(username, token) {
        const headers = {
            'Client-ID': clientId,
            'Authorization': `Bearer ${token}`
        };

        const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, { headers });
        const userData = await userResponse.json();
        if (userData.data.length === 0) {
            return { status: 'not_found', user_name: username };
        }
        const userId = userData.data[0].id;

        const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, { headers });
        const streamData = await streamResponse.json();
        if (streamData.data.length === 0) {
            return { status: 'offline', user_name: username };
        }

        const streamInfo = streamData.data[0];
        const streamDetails = {
            status: 'live',
            user_name: streamInfo.user_name,
            title: streamInfo.title,
            viewer_count: streamInfo.viewer_count,
            started_at: streamInfo.started_at
        };

        return streamDetails;
    }

    const token = await getAccessToken();
    const outputElement = document.getElementById('output');

    if (!outputElement) {
        console.error('Output element not found');
        return;
    }

    const streamInfos = await Promise.all(usernames.map(username => getStreamInfo(username, token)));

    streamInfos.sort((a, b) => {
        const statusOrder = { 'live': 1, 'offline': 2, 'not_found': 3 };
        
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }

        if (a.viewer_count !== b.viewer_count) {
            return b.viewer_count - a.viewer_count;
        }

        return 0;
    });

    streamInfos.forEach(streamInfo => {
        const span = document.createElement('span');
        span.className = 'user-info';
        if (streamInfo.status === 'not_found') {
            span.textContent = `${streamInfo.user_name} not found.`;
        } else if (streamInfo.status === 'offline') {
            span.textContent = `${streamInfo.user_name} is not currently streaming.`;
        } else { // live
            const output = `
                User Name: ${streamInfo.user_name}<br>
                Title: ${streamInfo.title}<br>
                Viewer Count: ${streamInfo.viewer_count}<br>
                Started At: ${new Date(streamInfo.started_at).toLocaleString()}
            `;
            span.innerHTML = output;
        }
        outputElement.appendChild(span);
    });
});