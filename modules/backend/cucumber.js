module.exports = {
  default: {
    paths: ['test/features/**/*.feature'],
    require: ['test/steps/**/*.ts', 'test/support/**/*.ts'],
    requireModule: ['ts-node/register/transpile-only'],
    format: ['@cucumber/pretty-formatter', 'html:test-results/cucumber-report.html', 'json:test-results/cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' }
  }
}; 