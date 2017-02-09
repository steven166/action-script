
import { Flag, FlagOptions } from "./flag";

export class Option extends Flag{
  private _value: any;
  private _parser: ( value: string ) => any;

  constructor(name:string, options?:OptionOptions){
    super(name, options);
    if(options) {
      this._value  = options.value;
      this._parser = options.parser;
      this.order = options.order || 0;
    }
  }

  get value(): any {
    return this._value;
  }

  get parser(): ( value: string ) => any {
    return this._parser;
  }

  public parse(value:string):any{
    if(this._parser){
      return this._parser(value);
    }
    return value;
  }
}

export interface OptionOptions extends FlagOptions{

  value?:any,
  parser?:(value:string)=>any

}