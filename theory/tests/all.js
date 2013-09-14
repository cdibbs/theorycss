exports.testParser = require("./case-studies/all-studies");

if (require.main === module)
    require("test").run(exports);
