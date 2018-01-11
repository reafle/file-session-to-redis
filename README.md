Uses [paulmillr/chokidar](https://github.com/paulmillr/chokidar) to watch php session files and upon detecting changes it

Usage is very crude for this prototype:

- clone
- edit main.js and configure:
  - Connection to redis
  - Path where current php sessions are stored (by default /var/lib/php/session)
  - What prefix to use in redis
- run like `node main.js`

