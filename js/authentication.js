
// Function to log in and store the auth token in a cookie
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
            document.cookie = `authToken=${data.authToken}; path=/; samesite=lax`;
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

// Function to retrieve a cookie by name
export function getCookie(name) {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
}
