import { Command, _list, _boolean, _number, _int } from "./command";
import * as path from 'path';

export class Cli extends Command {


  constructor( options?: CliOptions ) {
    super();
    if ( options ) {
      this.version(options.version || (options.packageJson && options.packageJson.version));
      this.description( options.description || (options.packageJson && options.packageJson.description) );
    }
    let filename = path.basename(process.mainModule.filename);
    if(filename.lastIndexOf('.js') === filename.length-3){
      filename = filename.substring(0, filename.length-3);
    }
    this.name(filename);
  }

  public static list    = _list;
  public static boolean = _boolean;
  public static number  = _number;
  public static int     = _int;

}

export interface CliOptions {
  packageJson?: any;
  description?: string;
  version?: string;
}