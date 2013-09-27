exports.testParser = require("./parser/case-studies/all-studies");
exports.testExamples = require("./parser/all-examples");
exports.testCompiler = require("./compiler/all");

if (require.main === module)
    require("test").run(exports);
