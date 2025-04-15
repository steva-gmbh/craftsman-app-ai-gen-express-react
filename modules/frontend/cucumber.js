export default {
  default: {
    paths: ['src/tests/features/**/*.feature'],
    require: ['src/tests/step_definitions/**/*.ts', 'src/tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:reports/cucumber-report.html', 'json:reports/cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true
  }
}; 