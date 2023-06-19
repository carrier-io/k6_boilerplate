import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { stagingConfig,RAMP_UP, DURATION, VUSERS,THINK_TIME_MAX, THINK_TIME} from '../core/environmentConfig.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { DEFAULT_HEADERS, PASSWORD}  from '../core/constants.js'
import { randomString, randomIntBetween } from '../core/helpers.js';


/**
 *  Stages example configuration
 * contacts: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '0s',
    },
 * 
 */

export const options = {
    maxRedirects: 0, // disable follow redirects
    thresholds: {
        // my_rate: ["rate>=0.4"], // Require my_rate's success rate to be >=40%
        // http_req_duration: ["avg<1000"], // Require http_req_duration's average to be <1000ms
        'group_duration{group:::01_Open_Swagger}': ['avg < 1'],
        'group_duration{group:::02_Open_todos}': ['avg < 1']
    },
    scenarios: {
        registration_scenario: {
            env: stagingConfig(),
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                {duration: RAMP_UP, target: VUSERS},
                {duration: DURATION, target: 0},
            ],
            gracefulRampDown: '0s',
            // executor: 'shared-iterations', // USER FOR VALIDATION
        }
    }
};


// main loop
export default function () {
    if (__ITER == 0) {
        console.log(`New session started: ${new Date().toISOString()}`);
    }

    let todoID;
    let timestamp = new Date().getTime();
    let username = randomString(5) + timestamp;

    getReq('01_Open_Swagger', `${__ENV.BASE_URL}`, 'GET_main', 'Test API');

    // User think time. Duration, in seconds. 
    sleep(randomIntBetween(THINK_TIME, THINK_TIME_MAX));

    group('02_Open_todos', () => {
        const response = http.get(`${__ENV.BASE_URL}/todos/`, {
            tags: { name: 'GET_todos' }
        });

        todoID = response.json()._id;
        check(response, {
            "status code should be 200": res => res.status === 200,
        });
        check(response, {
            "response should have more than 3 items,": res => res.json().length > 3,
        }) || console.log(response);
    });

    // User think time.
    sleep(randomIntBetween(THINK_TIME, THINK_TIME_MAX));

    getReq('03_Open_register', `${__ENV.BASE_URL}/login/register`, 'GET_register', 'Register');

    // User think time.
    sleep(randomIntBetween(THINK_TIME, THINK_TIME_MAX));

    group('04_Submit_register', () => {
        let post_data = { "username": username, "password": PASSWORD, "email": `${username}@test.com` };
        let response = http.post(`${__ENV.BASE_URL}/login/register`, post_data, { tags: { name: 'POST_register' } });
        let reg_assertion = 'Thanks for registering!';
        check(response, {
            "4: registatinon completed": (res) => res.body.includes(reg_assertion),
        }) || console.log("Registration FAILED with next response: " + response.body + "\nPOST Data: " + JSON.stringify(post_data));
        check(response, {
            "4: status code should be 200": res => res.status === 200,
        });
    });

    // User think time.
    sleep(randomIntBetween(THINK_TIME, THINK_TIME_MAX));

    getReq('05_Open_login', `${__ENV.BASE_URL}/login/`, 'GET_login', 'Login')

    // User think time.
    sleep(randomIntBetween(THINK_TIME, THINK_TIME_MAX));

    group('06_Submit_login', () => {
        do_login(username, PASSWORD);
        open_home()
    });

    getReq('07_Click_home_icon', `${__ENV.BASE_URL}/home`, 'GET_home', 'Rodman')

    // User think time.
    sleep(randomIntBetween(THINK_TIME, THINK_TIME_MAX));

    getReq('08_Open_validate_profile_info', `${__ENV.BASE_URL}/home/profile`, 'GET_profile', username)

    // This function performs a login POST operation to authenticate the user.
    function do_login(username, password) {
        let headers = DEFAULT_HEADERS;
        // We set the content type specifically for form POSTs
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        let params = { "headers": headers, tags: { name: 'POST_login' } };
        let url = `${__ENV.BASE_URL}` + "/login/";
        let form_data = {
            "username": username,
            "password": password,
        };
        let response = http.post(url, form_data, params);
        // verify login succeeded
        check(response, {
            "6: login succeeded": (res) => res.headers['Location'] === ("/home")
        }) || console.log("Login failed!  Redirect URL was not found in response" + JSON.stringify(response.headers));
    }

    function open_home() {
        let response = http.get(`${__ENV.BASE_URL}/home`, { tags: { name: 'GET_home' } });
        let reg_assertion = 'Rodman';
        check(response, {
            "6: Home page opened": (res) => res.body.includes(reg_assertion),
        }) || console.log("GET_home request FAILED");
        check(response, {
            "6: status code should be 200": res => res.status === 200,
        });
    }

    function getReq(groupName, path, reqName, assertionMs) {
        let check_msg = `response should have ${assertionMs}`;
        group(groupName, () => {
            const response = http.get(path, {
                tags: { name: reqName }
            });
            check(response, {
                "status code should be 200": res => res.status === 200,
            });

            check(response, {
                check_msg  : res => res.body.includes(assertionMs),
            });

        });

    }

}

export function handleSummary(data) {
    return {
      "summary.html": htmlReport(data),
    };
  }