import { ENVIRONMENT } from 'core/index';
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter } from 'k6/metrics';

export const requests = new Counter('http_reqs');

export const options = {
  stages: [
    { target: 20, duration: '10s' },
    { target: 15, duration: '5s' },
    { target: 0, duration: '2s' },
  ],
  thresholds: {
    requests: ['count < 100'],
    'group_duration{group:::01_Open_Swagger}': ['avg < 1'],
    'group_duration{group:::02_Open_todos}': ['avg < 1'],
  },
};

export default () => {
  const res = http.get(ENVIRONMENT);

  sleep(1);

  const checking = check(res, {
    'status is 200': (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Feel free to browse') !== -1,
  });
};



