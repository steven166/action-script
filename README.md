# action-script
Build powerful and robust NodeJS Command Line Interfaces with action-script

## Install
```
npm install --save action-script
```

## Usage

**cli.ts**
```
#!/usr/bin/env node

import {Cli} from 'action-script';
var packageJson:any = require('../../package.json');

var cli = new Cli({
  packageJson: packageJson
});

cli.command(require('./cli.example'));

cli.command('help')
    .description('Show help')
    .order(2000)
    .action(() => {
      cli.showHelp();
    });

cli.run(process.argv.splice(2));
```
**cli.example.ts**
```
import { Command } from 'cli-framework';

export default new Command( "example" )
    .description("Example command")
    .option( '-s, --say <test>', { desc: 'Say something', value: 'nothing to say?' } )
    .flag('--do-yellow', {desc: "Say it in yellow"})
    .action( ( args: { args?: any[], options?: any, flags?: any }, resolve: ( result?: any ) => void, reject: ( err?: any ) => void ) => {
        let color = args.flags['do-yellow'] ? 'yellow' : 'black';
        console.info(color + '> ' + args.options['say'];
    } );
```
