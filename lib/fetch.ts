import { parseRoutes, RouteDefinition } from './ng/index';
import chalk from 'chalk';
import { fetch } from './ga';

import * as meow from 'meow';

const error = (s: string) => {
  console.error(chalk.red(s));
  process.exit(1);
};

const cli = meow(
  `Usage
$ smarty <options>

Options
--view-id, -v Google Anaytics View ID
--credentials, -c JSON file containing email and private key
--start-date, -s Start date of the report
--end-date, -e End date of the report
--aggregate, -a Aggregate the routes
--project, -p TypeScript project

Examples
$ smarty 
  --view-id 11111
  --credentials ga.json
  --start-date 10-10-2018
  --end-date 11-11-2018
  --aggregate true
  --project tsconfig.json
`,
  {
    flags: {
      viewId: {
        type: 'string',
        alias: 'v'
      },
      credentials: {
        type: 'string',
        alias: 'c'
      },
      startDate: {
        type: 'string',
        alias: 's'
      },
      endDate: {
        type: 'string',
        alias: 'e'
      },
      aggregate: {
        type: 'boolean',
        alias: 'a',
        default: false
      },
      project: {
        type: 'string',
        alias: 'p'
      }
    }
  }
);

const key = require(cli.flags.credentials);
const viewId = cli.flags.viewId;
const start = cli.flags.startDate;
const end = cli.flags.endDate;
const aggregate = cli.flags.aggregate;
const project = cli.flags.project;

if (aggregate && !project) {
  error('For aggregated information you should provide a project path');
}

let applicationRoutes: RouteDefinition[] = [];
if (aggregate) {
  applicationRoutes = parseRoutes(project);
}

fetch(
  key,
  viewId,
  {
    startDate: new Date(start),
    endDate: new Date(end)
  },
  r => r.replace('/app', ''),
  aggregate ? applicationRoutes.map(f => f.path) : []
).then(
  () => {
    console.log(chalk.green('Data processed successfully'));
  },
  e => {
    error(chalk.red(e));
  }
);
