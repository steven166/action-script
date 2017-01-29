
import { Command } from "../command";

var command = new Command( 'publish <args?...>' )
    .description( "Publish the MicroDocs definitions" )
    .option( '--url', { desc: "Urls", value: 'http://microdocs.io' } )
    .extends(require('./build.cli').default)
    .action( function ( args, opts ) {
      console.info('publish', args, opts);
    } );

export default command;