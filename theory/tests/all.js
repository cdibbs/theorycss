exports.testParser = require("./case-studies/studies");

if (require.main === module)
    require("test").run(exports);
