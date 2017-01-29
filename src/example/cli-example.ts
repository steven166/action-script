import { Cli } from '../cli';
var packageJson = require( '../../package.json' );

var cli = new Cli( packageJson );

cli.command(require('./build.cli'));
cli.command(require('./publish.cli'));

cli.run( process.argv.slice(2) );