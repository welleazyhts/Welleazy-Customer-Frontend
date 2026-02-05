
const http = require('http');

http.get('http://3.110.32.224/api/health-assessments/choices/', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Raw data:', data);
        }
    });
}).on('error', (err) => {
    console.log('Error: ' + err.message);
});
