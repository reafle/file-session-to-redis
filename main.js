// =============== vars
var defaultTtl = 604800;
var redisHost = "127.0.0.1";
var redisPort = 6379;
var phpSessionPath = "/tmp/php_sess";
var prefix = "tb___";
var stdout_enabled = true;

// =============== requires
var fs = require("fs");
var nPath = require("path");
var chokidar = require("chokidar");
var redis = require("redis");
var redisClient = redis.createClient({
    host: redisHost,
    port: redisPort,
    prefix: prefix,
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }

        // reconnect after
        return Math.min(2 * 100, 3000);
    }
});

 
var log = (string) => {
    if (stdout_enabled) {
        console.log(string);
    }
};

redisClient.on("error", function (err) {
    log("Redis error " + err);
});

var Handlers = {
    create: (filepath) => {
        fs.stat(filepath, (err, stat) => {
            if(err != null) { log(`Stat error : ${err}`); return; }
            fs.readFile(filepath, "ascii", (err, content) => {
                if(err != null) { log(`Read error : ${err}`); return; }
                redisClient.set(nPath.basename(filepath), content, 'EX', defaultTtl, redis.print);
            });
        });
    },

    remove: (filepath) => {
        log(`File ${filepath} has been removed`);
        redisClient.del(nPath.basename(filepath), redis.print);
    },
    error: (error) => log(`Watcher error: ${error}`)
};

var watcher = chokidar.watch(phpSessionPath + "/sess_*");
watcher
    .on("add", Handlers.create)
    .on("change", Handlers.create)
    .on("unlink", Handlers.remove)
    .on('error', Handlers.error);
