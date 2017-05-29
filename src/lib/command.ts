import { Option, OptionOptions } from "./option";
import { Flag, FlagOptions } from "./flag";
import { Argument, ArgumentOptions } from "./argument";
import { CommandArgs } from "./command-args";
import { CommandExtends } from "./command-extends";

const NAME_EXP = /\<(.*?)\>/g;

export class Command {

  private _parent: Command;
  private _version: string;
  private _name: string;
  private _usage: string;
  private _description: string;
  private _commands: Command[]   = [];
  private _arguments: Argument[] = [];
  private _options: Option[]     = [];
  private _flags: Flag[]         = [];
  private _action: ( input?: CommandArgs, resolve?: ( result?: any ) => void, reject?: ( err?: any ) => void ) => void;
  private _extends: CommandExtends[]    = [];
  private _order: number         = 0;
  private _strict:boolean = true;

  constructor( name?: string, parent?: Command ) {
    this._parent = parent;
    this._name   = name && name.split( ' ' )[ 0 ];

    let result: string[];
    while ( (result = NAME_EXP.exec( name )) ) {
      this._arguments.push( new Argument( result[ 1 ] ) );
    }

    this.flag( '-h, --help', { desc: 'output usage information', order: 2000 } );
    this.flag( '-V, --version', { desc: 'output the version number', order: 2000 } );
  }

  public command( name: string|Command ): Command {
    if ( typeof(name) === 'object' ) {
      let command: Command = name[ 'default' ] || name;
      command.parent( this );
      this._commands.push( command );
      return command;
    } else {
      let command = new Command( name, this );
      this._commands.push( command );
      return command;
    }
  }

  protected parent( command: Command ) {
    this._parent = command;
  }

  protected name( name: string ) {
    this._name = name;
  }

  public usage( usage: string ):Command {
    this._usage = usage;
    return this;
  }

  public description( description: string ):Command {
    this._description = description;
    return this;
  }

  public action( action: ( input?: CommandArgs, resolve?: ( result?: any ) => void, reject?: ( err?: any ) => void ) => void):Command {
    this._action = action;
    return this;
  }

  public arg( name: string, options?: ArgumentOptions ) :Command{
    this._arguments.push( new Argument( name, options ) );
    return this;
  }

  public option( name: string, options?: OptionOptions ):Command {
    this._options.push( new Option( name, options ) );
    return this;
  }

  public flag( name: string, options?: FlagOptions ):Command {
    this._flags.push( new Flag( name, options ) );
    return this;
  }

  public extends( command: Command, overrideArgs?:(args:CommandArgs) => void ):Command {
    let extend:CommandExtends = {
      command: command[ 'default' ] || command ,
      overrideArgs: overrideArgs
    };
    this._extends.push( extend );
    return this;
  }

  public order( order: number ) :Command{
    this._order = order;
    return this;
  }

  public strict(strict:boolean):Command{
    this._strict = strict;
    return this;
  }

  public isStrict():boolean{
    return this._strict;
  }

  public getExtends(): CommandExtends[] {
    return this._extends;
  }

  public getName(): string {
    return this._name;
  }

  public getFullName(): string {
    if ( this._parent ) {
      return this._parent.getFullName() + ' ' + this.getName();
    }
    return this.getName();
  }

  public getUsage( useFullName: boolean = true ): string {
    let usage: string = '';
    if ( useFullName ) {
      usage = this.getFullName();
    } else {
      usage = this.getName();
    }
    if ( this._usage ) {
      usage += ' ' + usage;
    } else {
      if ( this.getOptions().length > 0 || this.getFlags().length > 2 ) {
        usage += ' [options]';
      }
      if ( this.getArguments().length > 0 ) {
        this.getArguments().forEach( argument => {
          usage += ' <' + argument.name + (argument.required ? '' : '?') + (argument.rest ? '...' : '') + '>';
        } );
      }
      if ( this._commands.length > 0 ) {
        usage += ' [command]';
      }
    }

    return usage;
  }

  public getDescription(): string {
    return this._description;
  }

  public getArguments(): Argument[] {
    return this._arguments;
  }

  public getOptions(): Option[] {
    let options: Option[] = this._options;
    if ( this.getExtends() ) {
      this.getExtends().forEach( ( ext: CommandExtends, index: number ) => {
        options = ext.command.getOptions()
            .map( option => {
              option.order = option.order + 50 + index;
              return option;
            } )
            .filter( option => {
              return options.filter( o => o.names.filter( name => option.names.indexOf( name ) > -1 ).length > 0 ).length === 0
            } )
            .concat( options );
      } );
    }
    return options;
  }

  public getFlags(): Flag[] {
    let flags: Flag[] = this._flags;
    if ( this.getExtends() ) {
      this.getExtends().forEach( ( ext: CommandExtends, index: number ) => {
        flags = ext.command.getFlags()
            .map( flag => {
              flag.order = flag.order + 50 + index;
              return flag;
            } )
            .filter( flag => {
              return flags.filter( f => f.names.filter( name => flag.names.indexOf( name ) > -1 ).length > 0 ).length === 0
            } )
            .concat( flags );
      } );
    }
    return flags;
  }

  public version( version: string ): void {
    this._version = version;
  }

  public getVersion(): string {
    return this._version || (this._parent && this._parent.getVersion());
  }

  public getOption( optionName: string ): Option {
    return this.getOptions().filter( option => {
      if ( option.names.filter( name => name.toLowerCase() === optionName.toLowerCase() ).length > 0 ) {
        return true;
      }
      if ( option.alias.filter( alias => alias === optionName ).length > 0 ) {
        return true;
      }
      return false;
    } )[ 0 ];
  }

  public getFlag( flagName: string ): Flag {
    return this.getFlags().filter( flag => {
      if ( flag.names.filter( name => name.toLowerCase() === flagName.toLowerCase() ).length > 0 ) {
        return true;
      }
      if ( flag.alias.filter( alias => alias === flagName ).length > 0 ) {
        return true;
      }
      return false;
    } )[ 0 ];
  }

  public getAction(): ( input?: CommandArgs, resolve?: ( result?: any ) => void, reject?: ( err?: any ) => void ) => void {
    return this._action;
  }

  public showVersion( command: Command = this, exitCode: number = 0 ): void {
    console.info( 'Version: ' + command.getVersion() );
    process.exit( exitCode );
  }

  public showHelp( command: Command = this, exitCode: number = 0 ): void {
    console.info( '' );
    console.info( 'Usage: ' + command.getUsage() );
    console.info( '' );
    if ( command.getDescription() ) {
      console.info( command.getDescription() );
      console.info( '' );
    }
    let options = command.getFlags().concat( command.getOptions() ).sort( ( o1, o2 ) => o1.order - o2.order );
    if ( options.length > 0 ) {
      console.info( 'Options:' );
      console.info( '' );
      options.forEach( option => {
        let prefix = '  ';
        if ( option.alias.length === 0 ) {
          prefix += '    ' + option.names.map( name => '--' + name ).join( ', ' );
        } else {
          prefix += option.alias.map( alias => '-' + alias ).concat( option.names.map( name => '--' + name ) ).join( ', ' );
        }
        if ( option.usage ) {
          prefix += ' ' + option.usage;
        }
        while ( prefix.length <= 30 ) {
          prefix += ' ';
        }
        console.info( prefix, (option.desc ? option.desc : '') );
      } );
      console.info( '' );
    }
    if ( command._commands.length > 0 ) {
      console.info( 'Commands:' );
      console.info( '' );
      command._commands.sort( ( o1, o2 ) => o1._order - o2._order ).forEach( command => {
        let prefix = '  ' + command.getUsage( false );
        while ( prefix.length <= 40 ) {
          prefix += ' ';
        }
        console.info( prefix, command.getDescription() ? command.getDescription() : '' );
      } );
      console.info( '' );
    }

    process.exit( exitCode );
  }

  public showUsage( command: Command = this, exitCode: number = 0 ): void {
    console.info( '' );
    console.info( 'Usage: ' + this.getUsage() );
    console.info( '' );
    process.exit( exitCode );
  }

  public run( argv: string[], options: { [name: string]: any } = {}, flags: { [name: string]: boolean } = {} ): void {
    let args: string[]  = [];
    let trail: string[] = [];

    // map args
    for ( let i = 0; i < argv.length; i++ ) {
      let arg: string = argv[ i ];
      if ( arg.indexOf( '-' ) === 0 ) {
        let optionName: string = arg;
        while ( optionName.indexOf( '-' ) === 0 ) {
          optionName = optionName.substring( 1 );
        }
        let option = this.getOption( optionName );
        let flag   = this.getFlag( optionName );
        if ( option ) {
          if ( !argv[ i + 1 ] ) {
            this.showHelp( this, 1 );
          }
          let name        = option.getName();
          options[ name ] = option.parse( argv[ i + 1 ] );
        } else if ( flag ) {
          let name      = flag.getName();
          flags[ name ] = true;
          if ( name === 'version' ) {
            this.showVersion( this );
          } else if ( name === 'help' ) {
            this.showHelp( this );
          }
        } else {
          if(this._strict) {
            this.showHelp( this, 1 );
          }
        }
      } else {
        args.push( arg );
        if ( this._commands.length > 0 ) {
          trail = argv.splice( i + 1 );
          break;
        }
      }
    }

    this.getOptions().filter( option => options[ option.getName() ] === undefined && option.value !== undefined ).forEach( option => options[ option.getName() ] = option.parse( option.value ) );

    if ( this._commands.length == 0 ) {
      for ( let i = 0; i < this.getArguments().length; i++ ) {
        let argument = this.getArguments()[ i ];
        if ( argument.required && args[ i ] === undefined ) {
          this.showHelp( this, 1 );
        }
      }
      if ( this.getArguments().length > 0 ) {
        let lastArg = this.getArguments()[ this.getArguments().length - 1 ];
        if ( !lastArg.rest && args.length > this.getArguments().length ) {
          this.showHelp( this, 1 );
        }
      }
    }

    // find command
    if ( args.length > 0 ) {
      for ( let i = 0; i < this._commands.length; i++ ) {
        let command = this._commands[ i ];
        if ( command.getName().toLowerCase() === args[ 0 ] ) {
          command.run( trail, options, flags );
          return;
        }
      }
    }
    if ( this.getAction() ) {
      let input: CommandArgs = {
        args: args,
        options: options,
        flags: flags,
        pipeResult: {}
      };
      this.invoke( this, input, ( result?: any ) => {
      }, ( err?: any ) => {
        if ( input.flags[ 'cli-debug' ] ) {
          console.error( err.stack || err.message || err );
        } else {
          console.error( err );
        }
      } );
      return;
    }

    this.showHelp( this, 1 );
  }

  private invoke( command: Command, input: CommandArgs, resolve: ( result?: any ) => void, reject: ( err?: any ) => void ): void {
    try {
      if ( command.getExtends() ) {
        this.invokeEach(command.getExtends(), 0, input, (pipeResult:any) => {
          try {
            if(pipeResult){
              input.pipeResult = Object.assign(input.pipeResult, pipeResult);
            }
            command.getAction()( input, resolve, reject );
          } catch ( e ) {
            reject( e );
          }
        }, reject);
      } else {
        command.getAction()( input, resolve, reject );
      }
    } catch ( err ) {
      reject( err );
    }
  }

  private invokeEach( commands: CommandExtends[], cursor:number, input: CommandArgs, resolve: ( result?: any ) => void, reject: ( err?: any ) => void ): void {
    let command = commands[cursor];
    if(command){
      if(command.overrideArgs){
        command.overrideArgs(input);
      }
      this.invoke(command.command, input, (pipeResult:any) => {
        if(pipeResult){
          input.pipeResult = Object.assign(input.pipeResult, pipeResult);
        }
        cursor++;
        if(commands[cursor]){
          this.invokeEach(commands, cursor, input, resolve, reject);
        }else{
          resolve(input.pipeResult);
        }
      }, reject);
    }else{
      resolve(input.pipeResult);
    }
  }

  public static list    = _list;
  public static boolean = _boolean;
  public static number  = _number;
  public static int     = _int;
}

export function _list( value: string ): string[] {
  return value.split( ',' ).map( s => s.trim() );
}

export function _boolean( value: string ): boolean {
  return value.toLowerCase() === 'true';
}

export function _number( value: string ): number {
  return parseFloat( value );
}

export function _int( value: string ): number {
  return parseInt( value );
}