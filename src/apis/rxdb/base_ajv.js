// src\form\lib\rxdb\base_ajv.js
import Ajv from "ajv";
import addFormats from "ajv-formats";
import _ from 'lodash';

const preprocessors = {
  strArray: function(value) { return _.isString(value) ? _(value).split(',').map(_.trim).filter(Boolean).value() : (_.isArray(value) ? value.filter(Boolean) : []); },
  description: function(value) { return _.isString(value) ? _.trim(value) : ''; }
};

class AjvValidator {
  constructor(schema) {
    this.ajv = new Ajv({ allErrors: true, useDefaults: true, coerceTypes: 'true' });
    addFormats(this.ajv);

    this.ajv.addKeyword({
      keyword: "preprocess",
      modifying: true,
      schemaType: "string",
      compile: (preprocessKey, schema, parentSchema, dataPath, parentDataPath, rootData) => {
        const preprocessFunc = preprocessors[preprocessKey];
        return (dataValue, dataContext) => {
          dataContext.parentData[dataContext.parentDataProperty] = preprocessFunc(dataValue);
          return true;
        };
      },
      errors: false
    });

    this.schema = schema;
    this.validate = this.ajv.compile(schema);
    this.fieldValidators = {}; // Storing field validators if needed
    this.compileFieldValidators(schema, ''); // Initialize validators
  }

  compileFieldValidators(schema, basePath) {
    _.forEach(schema.properties, (value, key) => {
      const path = basePath ? `${basePath}.${key}` : key;
      const fieldSchema = { type: "object", properties: { [key]: value }, required: [key] };
      this.fieldValidators[path] = this.ajv.compile(fieldSchema);
      if (value.properties) { this.compileFieldValidators(value, path); }
    });
  }
  
  validateData(data) {
    const valid = this.validate(data);
    return { valid, errors: this.validate.errors };
  }

  validateField(fieldPath, fieldValue) {
    const validator = _.get(this.fieldValidators, fieldPath) || this.ajv.compile({ type: "object", properties: { [fieldPath]: _.get(this.schema.properties, fieldPath) }, required: [fieldPath] });
    const valid = validator({ [fieldPath]: fieldValue });
    return { valid, errors: validator.errors, fieldValue: fieldValue };
  }
  
}

export default AjvValidator;
