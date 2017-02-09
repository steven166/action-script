import { Command } from "./command";
import { CommandArgs } from "./command-args";

export interface CommandExtends {
  command: Command;
  overrideArgs?: ( args: CommandArgs ) => void;
}