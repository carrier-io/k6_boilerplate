const USERS = [
    { "username": "testuser1", "password": "testuser1" }
];

const PASSWORD = 'defaultPwd';

// Emulate Chrome on MacOS
const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    //    "Accept-Encoding": "gzip, deflate, sdch",  --- we do not want compressed content
    "Accept-Language": "en-US,en;q=0.8,sv;q=0.6"
};

export { USERS, DEFAULT_HEADERS, PASSWORD}