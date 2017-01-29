
import { Command } from "../command";

var command = new Command( 'build <args?...>' )
    .description( "Build the MicroDocs definitions" )
    .option( '-s, --source', { desc: "Specify the source folder", value: './' } )
    .option( '-t, --pattern', { desc: "patterns to match source files", value: '/**/*.ts,!/**/*.spec.ts', parser: Command.list } )
    .flag( "--no-cache" )
    .action( function ( args, opts ) {
      console.info('build', args, opts);
    } );

export default command;