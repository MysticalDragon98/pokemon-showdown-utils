import { initDatabaseConnection } from './lib/db';
import { initHTTPServer } from './lib/http';
import resetWatcherLoop from './lib/modules/ladder/resetWatcherLoop';
//* Imports

async function main () {
    await Promise.all([
        initDatabaseConnection(),
        initHTTPServer(),
        resetWatcherLoop(),
        //* Main
    ]);    
}

main();

process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);