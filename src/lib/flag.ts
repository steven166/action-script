export class Flag {

  private _names: string[] = [];
  private _alias: string[] = [];
  private _desc: string;
  private _usage:string;
  private _order:number;

  constructor( name: string, options?:FlagOptions){
    if(options) {
      this._desc  = options.desc;
      this._order = options.order || 1000;
    }

    let names = name.trim().split( ',' );
    if(names.length > 0){
      let lastName = names[names.length-1].trim();
      this._usage = lastName.substring(lastName.split(' ')[0].length).trim();
      names[names.length-1] = lastName.split(' ')[0];
    }
    names.map( n => n.trim() ).filter( n => n ).forEach( n => {
      if ( n.indexOf( '--' ) == 0 ) {
        this._names.push( n.substr( 2 ) );
      } else if ( n.indexOf( '-' ) == 0 ) {
        this._alias.push( n.substr( 1 ) );
      } else {
        throw new Error( `Invalid flag name: ${n}` );
      }
    } );
  }

  get names(): string[] {
    return this._names;
  }

  get alias(): string[] {
    return this._alias;
  }

  get desc(): string {
    return this._desc;
  }

  get usage(): string {
    return this._usage;
  }

  get order(): number {
    return this._order;
  }

  set order( value: number ) {
    this._order = value;
  }

  public getName():string{
    return this._names[0] || this._alias[0];
  }
}

export interface FlagOptions{

  desc?:string,
  order?:number;

}