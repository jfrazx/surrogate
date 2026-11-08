// tsx applies a tsconfig only to the files it includes. The root config covers src alone, which
// would compile the specs without experimentalDecorators, so point tsx at the test config.
process.env.TSX_TSCONFIG_PATH = require('node:path').join(__dirname, 'tsconfig.json');

require('tsx/cjs');
