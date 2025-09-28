const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// Minimal DOM stubs for running the browser-oriented code in Node
const elements = new Map();

function createElement(tagName = 'div') {
  const element = {
    tagName: tagName.toUpperCase(),
    children: [],
    style: {},
    attributes: {},
    parentElement: null,
    innerHTML: '',
    textContent: '',
    _value: '',
    appendChild(child) {
      child.parentElement = element;
      element.children.push(child);
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener() {},
    querySelector() { return null; },
    getContext() { return {}; },
    set value(val) { this._value = val; },
    get value() { return this._value; }
  };
  return element;
}

function getElementById(id) {
  if (!elements.has(id)) {
    const element = createElement('div');
    element.id = id;
    element.style = {};
    element.children = [];
    element.parentElement = createElement('div');
    if (id === 'productFilter' || id === 'warehouseFilter') {
      element.value = '';
    }
    if (id === 'warehouseChart') {
      element.getContext = () => ({
        canvas: element
      });
    }
    elements.set(id, element);
  }
  return elements.get(id);
}

const documentStub = {
  readyState: 'loading',
  addEventListener() {},
  createElement,
  getElementById,
  body: createElement('body'),
  documentElement: createElement('html')
};

documentStub.createTextNode = text => ({
  textContent: text
});

documentStub.querySelector = () => null;

documentStub.createElementNS = () => createElement();

documentStub.createEvent = () => ({ initEvent() {} });

const context = {
  console,
  document: documentStub,
  window: {},
  showStatus: () => {},
  alert: () => {},
  Chart: undefined,
  Intl,
  setTimeout,
  clearTimeout,
  fetch: async () => { throw new Error('fetch not implemented in tests'); },
  FileReader: function () {}
};

context.FileReader.prototype = {
  readAsArrayBuffer() {},
  addEventListener() {}
};

vm.createContext(context);

const appJsPath = path.join(__dirname, '..', 'app.js');
const appCode = fs.readFileSync(appJsPath, 'utf8');
vm.runInContext(appCode, context);
vm.runInContext('this.__getSalesData = () => salesData;', context);

const testData = [
  ['город', 'товар', 'количество', 'сумма'],
  ['Москва', 'Товар A', '0', '100'],
  ['Москва', 'Товар B', ' 2 ', '200'],
  ['Москва', 'Товар C', '', '']
];

context.processSalesData(testData);
const salesData = context.__getSalesData();

assert.strictEqual(salesData.length, 3, 'Должно быть обработано 3 записи');
assert.strictEqual(salesData[0].quantity, 0, 'Количество должно сохранять значение 0');
assert.strictEqual(salesData[1].quantity, 2, 'Количество должно корректно парситься');
assert.strictEqual(salesData[2].quantity, 1, 'Пустое значение количества должно заменяться на 1');

console.log('processSalesData quantity parsing tests passed');
