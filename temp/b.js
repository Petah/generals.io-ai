var cluster = require('cluster');

console.log('b');
if (cluster.isMaster) {
    console.log('master');
    cluster.fork();
} else {
    console.log('worker');
}
