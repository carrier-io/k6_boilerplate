

export function developmentConfig(filename) {
    let envConfig = {
        BASE_URL: __ENV.ENV_URL || "https://perf.pythonanywhere.com",
        ENV: "DEVELOPMENT",
    };
    return Object.assign({}, envConfig, filename);
}

export function stagingConfig(filename) {
    let envConfig = {
        BASE_URL: __ENV.ENV_URL || 'https://karens.pythonanywhere.com',
        ENV: "STAGING",
    };
    return Object.assign({}, envConfig, filename);
}


const DURATION = __ENV.DURATION || '30s';
const VUSERS = __ENV.VUSERS || '10';
const RAMP_UP = __ENV.RAMP_UP || '30s';
let THINK_TIME = __ENV.THINK_TIME || 5;
let THINK_TIME_MAX = __ENV.THINK_TIME_MAX || 10;

export {DURATION, VUSERS, RAMP_UP, THINK_TIME, THINK_TIME_MAX}