exports.testParser = require("./parser/case-studies/all-studies");
exports.testExamples = require("./parser/all-examples");

if (require.main === module)
    require("test").run(exports);
