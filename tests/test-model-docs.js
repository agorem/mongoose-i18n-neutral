const mongoose = require('mongoose');
const mongooseI18nNeutral = require('../index');

const languages = ['es', 'fr', 'en'];
mongoose.plugin(mongooseI18nNeutral, { languages });

const chai = require('chai');
const expect = chai.expect;

const DummyHelper = require('./helpers/DummyHelper');

describe('Default usage', () => {
  it('Valid i18n model', () => {
    const testModel = DummyHelper.getI18nValidModel('demo-i18n-ok');
    expect(testModel.getLanguages()).to.deep.equal(languages);

    const doc = new testModel();
    expect(doc.getLanguages()).to.deep.equal(languages);

    doc.name.default = 'hello';
    doc.name.es = 'hola';
    doc.name.fr = 'salut';

    expect(doc.name._def).to.equal('hello');
    expect(doc.name.es).to.equal('hola');
    expect(doc.name.fr).to.equal('salut');
    expect(doc.name).to.have.property('en');
    expect(doc.name.default).to.equal('hello');
    expect(doc.name.i18n).to.include({
      _def: 'hello',
      es: 'hola',
      fr: 'salut'
    });
  });

  it('Invalid i18n model', () => {
    expect(() => {
      const model = DummyHelper.getI18nInvalidModel('demo-i18n-nok');
    }).to.throw('mongoose-i18n-neutral plugin applies only to Strings');
  });
});
