# k6_boilerplate

Example:
```bash
k6 run src/tests/stg-todos.js  --out json=test.json \ 
  -e THINK_TIME=1 -e THINK_TIME_MAX=5 \
  -e ENV_URL=https://yourapp.com -e DURATION="30s" \ 
  -e VUSERS=5 -e RAMP_UP="1s"
```
