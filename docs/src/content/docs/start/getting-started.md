const { run } = require('@asunajs/caiyun');
const { resolve } = require('path');

(async () => {
  await run(resolve(process.cwd(), './asign.json')); // 按需修改路径
})();
{
  "caiyun": [
    {
      "auth": "Basic cGM6MTQ3ODg4ODgzMjA6UFp0YWV5eWJ8MXxSQ1N8MTcxNDAzNTQzNzU0OXxpTUNJT2JlRFpmdWdJMjRtRWFDZ0RHLkdRNVd3aXVTNFF3Qjl1MFdwZ09NenVtMWFnMDV0M1JzbG91YnpIWTRVX1FtcEl6cXk4YmE0WURVcEYzWnQ3eUN6OHpGSWZmVDZneW1leHBUWExORzZDYTRHSmJXbVNVMGNCNW5wRDJqdERfSVJPbkRHNnJFOXFYTTVWcUpkT0gxNVdvMU1IWEtJeXZJcVYzaW1rcWst"
    }
  ]
}
