import util from 'util';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';


/* Use "command-line-args" and "command-line-usage" packages to parse command line
arguments and show usage help. On success the argument object is returned, on failure
the process exits with exit value 1.

"name" is the name of the program, shown in usage help.

"description" is the description of the program, shown in usage help.

"argDefinitions" is the argument definition object as supported by "command-line-args".
Additionally, arguments can be marked as mandatory with the boolean property "mandatory". */

const cmdLineArgs = (name, description, argDefinitions) => {
   let args;
   try {
      args = commandLineArgs(argDefinitions);
   } catch (error) {
      console.warn(error.message);
      process.exit(1);
   }

   let fail = false;

   /* If no arguments are given show usage help and exit */

   if (process.argv.length < 3) {
      console.log(commandLineUsage([
         {
            header: name,
            content: description
         },
         ...argDefinitions.find(arg => arg.defaultOption) ?
            [{
               header: 'Synopsis',
               content: `$ ${name} ` + argDefinitions.filter(arg => arg.defaultOption).map(arg => `{underline ${arg.name}}`).join(' ')
            }] :
            [],
         ...argDefinitions.find(arg => arg.mandatory && !arg.defaultOption) ?
            [{
               header: 'Mandatory arguments',
               optionList: argDefinitions.filter(arg => arg.mandatory)
            }] :
            [],
         ...argDefinitions.find(arg => !arg.mandatory) ?
            [{
               header: 'Optional arguments',
               optionList: argDefinitions.filter(arg => !arg.mandatory)
            }] :
            []
      ]));
      process.exit(1);
   }

   /* If a mandatory argument is missing a value, show error and exit */

   const missing = argDefinitions.filter(arg => arg.mandatory && arg.name in args === false);
   if (missing.length > 0) {
      for (const arg of missing)
         console.warn(
            'Missing mandatory argument:',
            (arg.alias ? `${util.styleText(['bold'], '-' + arg.alias)}, ` : '') + util.styleText(['bold'], `--${arg.name}`),
            util.styleText(['underline'], arg.type?.name.toLowerCase() ?? 'string')
         );
      fail = true;
   }

   /* If any value is null, show error and exit */

   const invalid = argDefinitions.filter(arg => arg.name in args && args[arg.name] === null);
   if (invalid.length > 0) {
      for (const arg of invalid)
         console.warn(`Argument ${util.styleText(['bold'], `--${arg.name}`)} has invalid value`);
      fail = true;
   }

   if (fail) {
      console.warn('\nRun without arguments to see usage help');
      process.exit(1);
   }

   return args;
};

export default commandLineArgs;
