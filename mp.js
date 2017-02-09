const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

let id = 0;
let callbacks = {};

module.exports.fork = (env) => {
    let worker = cluster.fork(env);
    worker.on('message', (message) => {
        // console.log(`Master ${process.pid} message`, message);
        if (message.id) {
            callbacks[message.id](message.responseData);
        }
    });
    return worker;
};

module.exports.send = (worker, data, callback) => {
    id++;
    callbacks[id] = callback;
    worker.send({
        id: id,
        data: data,
    });
};

module.exports.start = (worker, data, callback) => {
    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
        });

        require('./main.js');
    } else {
        console.log(`Worker ${process.pid} started ${process.env.worker}`);
        require('./workers/' + process.env.worker + '.js');
    }
};

module.exports.on = (callback) => {
    if (!cluster.isMaster) {
        process.on('message', (message) => {
            // console.log(`Worker ${process.pid} message`, message);
            callback(message.data, (responseData) => {
                // console.log(`Worker ${process.pid} response`, responseData);
                process.send({
                    id: message.id,
                    responseData: responseData,
                });
            });
        });
    }
};
