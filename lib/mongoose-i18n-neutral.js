'use strict';

var mongoose = require('mongoose');
var extend   = require('util')._extend;

var exports = function mongooseI18nNeutral(schema, options) {
  if (!options || !options.languages || !Array.isArray(options.languages) || !options.languages.length) {
    throw new mongoose.Error('Required languages array is missing');
  }

  // plugin options to be set under schema options
  schema.options.mongooseI18nNeutral = {};
  var pluginOptions = schema.options.mongooseI18nNeutral;

  pluginOptions.languages = options.languages.slice(0);

  schema.eachPath(function (path, schemaType) {

    if (schemaType.schema) {
      schemaType.schema.plugin(mongooseI18nNeutral, pluginOptions);
      return;
    }

    if (!schemaType.options.i18n) {
      return;
    }

    if (!(schemaType instanceof mongoose.Schema.Types.String)) {
      throw new mongoose.Error('Mongoose-i18n plugin applies only to Strings');
    }

    delete schemaType.options.i18n;

    var fieldPath = path.split('.');
    var fieldName = fieldPath.pop();
    var fieldPrefix = fieldPath.join('.');

    if (fieldPrefix) fieldPrefix += '.';

    // Remove original field schema
    schema.remove(path);
    
    // Schema tree update (node removal)
    var treeNode = fieldPath.reduce(function (parent, node) {
      return parent[node];
    }, schema.tree);

    delete treeNode[fieldName];

    schema.virtual(path + '.default')
      .get(function () {
        var doc = (this.ownerDocument) ? this.ownerDocument() : this;
        doc.get(path + '.' + '_def');
      })
      .set(function (value) {
        var doc = (this.ownerDocument) ? this.ownerDocument() : this;
        doc.set(path + '.' + '_def', value);
      });

    schema.virtual(path + '.i18n')
      .get(function () {
        return this.getValue(path);
      });
    

    var schemaI18nObject = {};
    schemaI18nObject[fieldName] = {};

    var i18nDefault = extend({}, schemaType.options);
    i18nDefault.required = true;
    schemaI18nObject[fieldName]['_def'] = i18nDefault;

    pluginOptions.languages.forEach(function (lang) {
      var schemaI18nLang = extend({}, schemaType.options);

      delete schemaI18nLang.i18n;
      delete schemaI18nLang.default;
      schemaI18nLang.required = false;

      this[lang] = schemaI18nLang;
    }, schemaI18nObject[fieldName]);

    schema.add(schemaI18nObject, fieldPrefix);
  });

  /*
   * Model methods to get the languages available
   */
  schema.method({
    getLanguages: function () {
      return this.schema.options.mongooseI18nNeutral.languages;
    }
  });

  schema.static({
    getLanguages: function () {
      return this.schema.options.mongooseI18nNeutral.languages;
    }
  });
};

module.exports = exports;
