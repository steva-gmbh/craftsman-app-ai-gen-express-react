module.exports = {
  default: {
    paths: ['src/tests/features/homepage.feature'],
    require: [
      'src/tests/step_definitions/homepage.steps.cjs',
      'src/tests/support/hooks.cjs',
      'src/tests/support/custom-world.cjs'
    ],
    format: ['@cucumber/pretty-formatter', 'html:reports/cucumber-report.html', 'json:reports/cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true
  }
}; 