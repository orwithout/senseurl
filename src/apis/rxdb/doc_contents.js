// src\apis\rxdb\doc_indexes_collection.js
import getRxdbCollection from './base_rxdb.js';
import AjvValidator from './base_ajv.js';
import _ from 'lodash';

// JSON Schema definition
const doc_indexes_schema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {type: 'string',maxLength: 255, description: 'Primary key, use UUID v4'},
    type: {type: 'string',enum: ["text/bookmark", "text/txt", "text/json", "text/markdown", "text/html", "app/pdf", "app/docx"], description: 'app/suffix'},
    name: {type: 'string',maxLength: 255},
    content: {type: 'string',maxLength: 102400},

    size: {type: 'number',minimum: 0},
    timestamp: {type: 'string',format: 'date-time'},
    actor: {type: 'string',maxLength: 255},
    decryptionKeys: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 255}, preprocess: 'strArray'},
    
    attributedTo: {type: 'string',maxLength: 4095},
    newVersionInbox: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 255}, preprocess: 'strArray'},
    newVersionOutbox: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 255}, preprocess: 'strArray'},

    following: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 255}, preprocess: 'strArray'},
    followers: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 255}, preprocess: 'strArray'},
    liked: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 255}, preprocess: 'strArray'},
    tags: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 255}, preprocess: 'strArray'},

    icon: {type: 'string',maxLength: 4095},
    description: {type: 'string',maxLength: 1024},
    history: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 255}, preprocess: 'strArray'}
  },
  required: ['id', 'type', 'name', 'content'],
  additionalProperties: false
};

// 单例模式导出验证方法
const { version, primaryKey, ...ajvSchema } = doc_indexes_schema;  // 去掉 version 和 primaryKey
const docValidator = new AjvValidator(ajvSchema);
const validateData = docValidator.validateData.bind(docValidator);
const validateField = docValidator.validateField.bind(docValidator);  // 绑定 validateField 方法


let schemaWithoutRequired = _.cloneDeep(ajvSchema);
delete schemaWithoutRequired.required;
const docValidatorWithoutRequired = new AjvValidator(schemaWithoutRequired);
const validateDataWithoutRequired = docValidatorWithoutRequired.validateData.bind(docValidatorWithoutRequired);


// 直接获取 RxDB 集合实例
async function getRxdbCollectionInstance() {
    return await getRxdbCollection('doc_indexes', doc_indexes_schema);
}

// 导出 validateData 和 validateField 方法
export { getRxdbCollectionInstance, validateData, validateField, validateDataWithoutRequired, doc_indexes_schema };
