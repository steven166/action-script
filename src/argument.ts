
export class Argument{

  private _required: boolean;
  private _rest?:boolean;
  private _name: string;

  constructor(name:string, options?:ArgumentOptions){
    this._required = (options && !options.optional) || true;
    this._rest = (options && !options.rest) || false;

    if(name.lastIndexOf('...') === name.length-3){
      this._rest = true;
      name = name.substring(0, name.length-3);
    }
    if(name.lastIndexOf('?') === name.length-1){
      this._required = false;
      name = name.substring(0, name.length-1);
    }
    this._name = name;
  }

  get required(): boolean {
    return this._required;
  }

  get rest(): boolean {
    return this._rest;
  }

  get name(): string {
    return this._name;
  }
}

export interface ArgumentOptions{

  optional?:boolean;
  rest?:boolean;

}