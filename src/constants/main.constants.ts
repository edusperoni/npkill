import { IConfig, IUiPosition } from '../interfaces/index.js';

export const MIN_CLI_COLUMNS_SIZE = 60;
export const CURSOR_SIMBOL = '~>';
export const WIDTH_OVERFLOW = '...';
export const DEFAULT_SIZE = '0 MB';
export const DECIMALS_SIZE = 2;
export const OVERFLOW_CUT_FROM = 11;

export const DEFAULT_CONFIG: IConfig = {
  backgroundColor: 'bgBlue',
  warningColor: 'brightYellow',
  checkUpdates: false,
  deleteAll: false,
  exclude: [],
  excludeHiddenDirectories: false,
  folderSizeInGB: false,
  maxSimultaneousSearch: 6,
  showErrors: true,
  sortBy: '',
  // targetFolder: 'node_modules',
};

export const MARGINS = {
  FOLDER_COLUMN_END: 19,
  FOLDER_COLUMN_START: 1,
  FOLDER_SIZE_COLUMN: 10,
  ROW_RESULTS_START: 8,
};

export const UI_HELP = {
  X_COMMAND_OFFSET: 3,
  X_DESCRIPTION_OFFSET: 27,
  Y_OFFSET: 2,
};

export const UI_POSITIONS: IUiPosition = {
  FOLDER_SIZE_HEADER: { x: -1, y: 7 }, // x is calculated in controller
  INITIAL: { x: 0, y: 0 },
  VERSION: { x: 38, y: 5 },
  NEW_UPDATE_FOUND: { x: 42, y: 0 },
  SPACE_RELEASED: { x: 50, y: 4 },
  STATUS: { x: 50, y: 5 },
  TOTAL_SPACE: { x: 50, y: 3 },
  ERRORS_COUNT: { x: 50, y: 2 },
  TUTORIAL_TIP: { x: 4, y: 7 },
};

// export const VALID_KEYS: string[] = [
//   'up', // Move up
//   'down', // Move down
//   'space', // Delete
//   'j', // Move down
//   'k', // Move up
//   'h', // Move page down
//   'l', // Move page up
//   'u', // Move page up
//   'd', // Move page down
//   'pageup',
//   'pagedown',
//   'home', // Move to the first result
//   'end', // Move to the last result
//   'e', // Show errors
// ];

const ASCII_PREFIX = `
-----
-
------
----
--
-------
`
  .split('\n')
  .filter((line) => line.trim().length > 0)
  .map((line, idx) => line.trim());
const maxSize = ASCII_PREFIX.reduce(
  (acc, line) => Math.max(acc, line.length),
  0,
);
const ASCII_ART_NAME = `
               __   .__.__  .__   
  ____   _____|  | _|__|  | |  |  
 /    \\ /  ___/  |/ /  |  | |  |  
|   |  \\\\___ \\|    <|  |  |_|  |__
|___|  /____  >__|_ \\__|____/____/
     \\/     \\/     \\/             
`;

export const BANNER = ASCII_ART_NAME.split('\n')
  .filter((line) => line.trim().length > 0)
  .map((line, idx) => {
    const prefix = ASCII_PREFIX[idx] || '-';
    const padding = ' '.repeat(maxSize - prefix.length);
    return `${prefix}${padding}${line}`.trim();
  })
  .join('\n');

export const STREAM_ENCODING = 'utf8';
