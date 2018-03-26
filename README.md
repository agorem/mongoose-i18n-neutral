# mongoose-i18n-neutral

Mongoose schema plugin for multiligual fields (language neutral).

This project is based on Alex Skorichenko project [mongoose-intl](https://github.com/alexsk/mongoose-intl).

## Installation

```sh
npm install mongoose-i18n-neutral --save # or yarn add mongoose-i18n-neutral
```

## Overview

I18n modules usually requires to define a default language (if not uses english) as the base of translation process.

This approach may be adequate for some projects, but it is not when we have to manage international data fields containing native language values or we would like to optimize the translation process (not all of default translations must use the same language).

Geonames city name files are a clear example of the use native language.

### The approach

Instead of using a default language, this plugin transforms the String schemas with the **i18n** option into an Object schema with the following properties:

* **\_def**: Property to store the default translation (language agnostic)
* **lang_code**: Additional properties for each language defined in the plugin configuration.

### Plugin registration

```js
const mongoose = require('mongoose');
const mongooseI18nNeutral = require('mongoose-i18n-neutral');
```

To define the plugin as global, register the plugin in mongoose before any schema instantiation.

```js
mongoose.plugin(mongooseI18nNeutral, {
  languages: ['en', 'es', 'de', 'fr']
});
```

To define the plugin at schema level, register the plugin

```js
GeoCountrySchema.plugin(mongooseI18nNeutral, {
  languages: ['en', 'es', 'de', 'fr']
});
```

### Plugin options

The plugin requires to define only one Array of strings parameter (**languages**) to define the alternative translations to store.

Set **useDefault** option to **false**, if you don't want to implement the default translation field.

> Tip: It is strongly recommended to use [ISO639 language codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) to identify the languages, but it is not mandatory.

### I18n schema definition

An schema will be considered as i18n or multilanguage, if any of their String fields has the property `i18n` set to `true`.

```js
const GeoCountrySchema = new mongoose.Schema({
  iso3: {
    type: String,
    required: true
  },
  name: {
    type: String,
    i18n: true,
    required: false
  },
  capital: {
    type: String,
    i18n: true,
    default: 'not-available'
  }
});
```

The plugin with transform the schema using the languages option provided as follows:

```js
const GeoCountrySchema = new mongoose.Schema({
  iso3: {
    type: String,
    required: true
  },
  name: {
    _def: {
      // Only in default usage
      type: String,
      required: true
    },
    en: {
      type: String,
      required: false
    },
    es: {
      type: String,
      required: false
    },
    de: {
      type: String,
      required: false
    },
    fr: {
      type: String,
      required: false
    }
  },
  capital: {
    _def: {
      // Only in default usage
      type: String,
      required: true
    },
    en: {
      type: String,
      required: false
    },
    es: {
      type: String,
      required: false
    },
    de: {
      type: String,
      required: false
    },
    fr: {
      type: String,
      required: false
    }
  }
});
```

> Note: The plugin overrides the `required` and `default` options to ensure that the default translation is always provided.

All others options defined (e.g. `lowercase`, `uppercase`, `trim`, `minlength`, `maxlength`, `match` etc.) will be propagated.

### Additional methods

Each i18n field has available some additional virtual methods to deal with their values.

```js
const GeoCountry = mongoose.model('countries', GeoCountrySchema);
const doc = new GeoCountry();
// Default translation: Stores the value in name._def
doc.name.default = 'Deutschland'; // Only in default usage
// Set the english translation
doc.name.en = 'Germany';
// Set the spanish translation
doc.name.es = 'Alemania';
// Returns the default translation
const defName = doc.name.default; // Only in default usage
// Returns the spanish translation
const esName = doc.name.es;
// Returns the name object with all translations
const translations = doc.name.all;
```

The Model and Document `getLanguages()` method returns the array of languages provided in the plugin configuration.

### Managing i18n documents

These documents and its i18n properties may be managed as any other mongo document.

We recommend not to include the virtual fields to the documents.

### Providing language-specific information

To provide the information available for a language, you can use a mongo query like this:

```js
db.countries.aggregate({
  $project: {
    _id: 1,
    i18Name: {
      $ifNull: ['name.es', 'name._def']
    }
  }
});
```
