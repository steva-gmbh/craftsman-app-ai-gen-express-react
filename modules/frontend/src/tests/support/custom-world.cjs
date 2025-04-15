const { World, setWorldConstructor } = require('@cucumber/cucumber');
const { Browser, BrowserContext, Page } = require('playwright');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = undefined;
    this.context = undefined;
    this.page = undefined;
  }
}

setWorldConstructor(CustomWorld);

module.exports = { CustomWorld }; 