'use strict';

const mongoose = require('mongoose');
const extend = require('util')._extend;

const mongooseI18nNeutral = function mongooseI18nNeutral(schema, options) {
  if (
    !options ||
    !options.languages ||
    !Array.isArray(options.languages) ||
    !options.languages.length
  ) {
    throw new mongoose.Error('Required languages array not provided');
  }

  if (typeof options.useDefault === 'undefined') {
    options.useDefault = true;
  } else if (typeof options.useDefault !== 'boolean') {
    throw new mongoose.Error('useDefault option value must be boolean');
  }

  // plugin options to be set under schema options
  schema.options.mongooseI18nNeutral = {};
  const pluginOptions = schema.options.mongooseI18nNeutral;

  pluginOptions.languages = options.languages.slice(0);
  pluginOptions.useDefault = options.useDefault;

  schema.eachPath((path, schemaType) => {
    if (schemaType.schema) {
      schemaType.schema.plugin(mongooseI18nNeutral, pluginOptions);
      return;
    }

    if (!schemaType.options.i18n) {
      return;
    }

    if (!(schemaType instanceof mongoose.Schema.Types.String)) {
      throw new mongoose.Error(
        'mongoose-i18n-neutral plugin applies only to Strings'
      );
    }

    delete schemaType.options.i18n;
    delete schemaType.options.default;
    delete schemaType.options.required;

    const fieldPath = path.split('.');
    const fieldName = fieldPath.pop();
    const fieldPrefix = fieldPath.join('.');

    if (fieldPrefix) fieldPrefix += '.';

    // Remove original field schema
    schema.remove(path);

    // Schema tree update (node removal)
    const treeNode = fieldPath.reduce(
      (parent, node) => parent[node],
      schema.tree
    );

    delete treeNode[fieldName];

    if (pluginOptions.useDefault) {
      schema
        .virtual(`${path}.default`)
        .get(function() {
          const doc = this.ownerDocument ? this.ownerDocument() : this;
          return doc.get(`${path}._def`);
        })
        .set(function(value) {
          const doc = this.ownerDocument ? this.ownerDocument() : this;
          doc.set(`${path}._def`, value);
        });
    }

    schema.virtual(`${path}.i18n`).get(function() {
      return this.getValue(path);
    });

    const schemaI18nObject = {};
    schemaI18nObject[fieldName] = {};

    if (pluginOptions.useDefault) {
      const i18nDefault = extend({}, schemaType.options);
      i18nDefault.required = true;
      schemaI18nObject[fieldName]['_def'] = i18nDefault;
    }

    pluginOptions.languages.forEach(lang => {
      const schemaI18nLang = extend({}, schemaType.options);
      schemaI18nLang.required = false;
      schemaI18nObject[fieldName][lang] = schemaI18nLang;
    });

    schema.add(schemaI18nObject, fieldPrefix);
  });

  /*
   * Model methods to get the languages available
   */
  schema.method({
    getLanguages() {
      return this.schema.options.mongooseI18nNeutral.languages;
    }
  });

  schema.static({
    getLanguages() {
      return this.schema.options.mongooseI18nNeutral.languages;
    }
  });
};

module.exports = mongooseI18nNeutral;
