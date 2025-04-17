const authState = {
    isAuthenticated: false,
    token: null
};

function setAuthState(isAuthenticated, token = null) {
    authState.isAuthenticated = isAuthenticated;
    authState.token = isAuthenticated ? token : null;
    console.log('Auth state updated:', authState);
}

function clearAuthToken() {
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setAuthState(false);
    console.log('Auth token cleared');
}

function handleUnauthorized() {
    clearAuthToken();
    console.log('Unauthorized, redirecting to login.html');
    window.location.href = 'login.html';
}

function checkResponse(response) {
    if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Unauthorized: Token expired or invalid');
    }
    return response;
}

export async function loginAndStoreToken(email, password) {
    try {
        const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/bizLogin', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();

        if (res.ok && data.authToken) {
            document.cookie = `authToken=${data.authToken}; path=/; samesite=lax; max-age=30`;
            setAuthState(true, data.authToken);
            console.log('Token received and stored as cookie');
            return data.authToken;
        } else {
            throw new Error(data.message || 'Failed to get auth token');
        }
    } catch (err) {
        console.error('Login failed:', err);
        throw err;
    }
}

export function getCookie(name) {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
}

export { authState, setAuthState, handleUnauthorized, checkResponse };