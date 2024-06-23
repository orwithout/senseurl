// src\apis\rxdb\doc_indexes.js
import getRxdbCollection from './base_rxdb.js';
import AjvValidator from './base_ajv.js';
import _ from 'lodash';



// JSON Schema definition
const doc_indexes_schema = {
  title: "senseurl.x document indexes schema",
  version: 0,
  primaryKey: 'localId',
  type: 'object',
  properties: {
    localId: {type: 'string',maxLength: 36, description: 'UUID v4'},
    localPath: {type: 'string',maxLength: 4095},
    localCid: {type: 'string',maxLength: 128},
    localVersions: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: 'object', properties: {cid: { type: 'string', maxLength: 128 },published: {type: 'string',format: 'date-time',maxLength: 30}},required: ['cid','published']}},
    doc: {
      type: 'object', properties: {
        id: {type: 'string',maxLength: 36, description: 'UUID v4'},
        type: {type: 'string', maxLength: 64,description: 'Event or MIME Type: Like, Create, text/bookmark, app/docx, link/docx, image/jpeg'},
        cid: {type: 'string',maxLength: 128, description: 'IPFS cid'}, 

        name: {type: 'string',maxLength: 64},
        preferredUsername: {type: 'string',maxLength: 64},   
        actor: {type: 'string',maxLength: 4095, description: 'like id'},
        attributedTo: {type: 'string',maxLength: 4095, description: 'like id'},
        profile: {type: 'string',maxLength: 4095, description: 'home page url'},
        publicKey: {type: 'string',maxLength: 1024, description: 'public key of the attributedTo'},
        accessKeys: {type: 'array', maxItems: 4095, uniqueItems: true,items: {type: 'object', properties: {id: { type: 'string', maxLength: 36 },encryptedKey: { type: 'string', maxLength: 1024 }},required: ['id', 'encryptedKey']}},
        signature: {type: 'string',maxLength: 1024, description: 'Private key signature'},

        size: {type: 'number',minimum: 0, maximum:10737418240, description: 'Bytes',multipleOf: 1},
        published: {type: 'string',format: 'date-time',maxLength: 30},
        updated: {type: 'string',format: 'date-time',maxLength: 30},
        deleted: {type: 'string',format: 'date-time',maxLength: 30},
        accessed: {type: 'string',format: 'date-time',maxLength: 30},
        icon: {type: 'array',maxItems: 4095,uniqueItems: true,items: {type: 'string',maxLength: 4095}, preprocess: 'strArray'},
        summary: {type: 'string',maxLength: 2048},
        commentsOn: {type: 'array', maxItems: 4095, uniqueItems: true,items: {type: 'object', properties: {id: { type:'string', maxLength: 36 },startIndex:{type:'integer',minimum:0},endIndex:{type:'integer',minimum:0}},required: ['id']}},
        liked: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {id: { type: 'string', maxLength: 36 },signature: {type: 'string',maxLength: 1024},name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ["id"]}},
        tags: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {tag:{type:'string',maxLength:64}, id: { type: 'string', maxLength: 36 },signature: {type: 'string',maxLength: 1024},name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ['tag']}},
        oldVersions: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object", properties: {cid: { type: 'string', maxLength: 128 },published: {type: 'string',format: 'date-time',maxLength: 30}},required: ['cid','published']}},

        content: {type: ["string", "number", "object", "array", "boolean", "null"], maxLength: 102400},
        object: {type: ["string", "number", "object", "array", "boolean", "null"], maxLength: 102400},
        source: {type: 'object', properties: {mediaType: { type: 'string', maxLength: 64 },content: { type: 'string', maxLength: 102400 }}, required: ['content']},

        to: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {id: { type: 'string', maxLength: 36 },name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ["id"]}},
        cc: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {id: { type: 'string', maxLength: 36 },name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ["id"]}},
        bcc: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {id: { type: 'string', maxLength: 36 },name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ["id"]}},
        inbox: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {id: { type: 'string', maxLength: 36 },name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ["id"]}},
        outbox: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {id: { type: 'string', maxLength: 36 },name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ["id"]}},
        following: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {id: { type: 'string', maxLength: 36 },name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ["id"]}},
        followers: {type: 'array', maxItems: 4095, uniqueItems: true, items: {type: "object",properties: {id: { type: 'string', maxLength: 36 },name: { type: 'string', maxLength: 64 },profile: { type: 'string', maxLength: 4095 }},required: ["id"]}},

      },required: ['id']
    }
  },
  required: ['localId','localPath'],
  indexes: ['localPath', 'localCid','doc.id','doc.type','doc.cid','doc.name','doc.actor','doc.profile','doc.size','doc.published','doc.updated','doc.accessed']
};


const migrationStrategies = {
  // 1: (oldDoc) => {
  //   // 添加新字段
  //   oldDoc.createdAt = new Date().toISOString();
    
  //   // 修改字段名
  //   oldDoc.userName = oldDoc.name;
  //   delete oldDoc.name;
    
  //   // 修改字段类型
  //   oldDoc.age = parseInt(oldDoc.age, 10);
    
  //   // 删除不再需要的字段
  //   delete oldDoc.temporaryField;
    
  //   // 处理嵌套数据
  //   if (oldDoc.address) {
  //     oldDoc.formattedAddress = `${oldDoc.address.street}, ${oldDoc.address.city}`;
  //   }
    
  //   return oldDoc;
  // }
};




// 单例模式导出验证方法
const { version, primaryKey, indexes, ...ajvSchema } = doc_indexes_schema;  // 去掉 version 和 primaryKey
const docValidator = new AjvValidator(ajvSchema);
const validateData = docValidator.validateData.bind(docValidator);
const validateField = docValidator.validateField.bind(docValidator);  // 绑定 validateField 方法


let schemaWithoutRequired = _.cloneDeep(ajvSchema);
delete schemaWithoutRequired.required;
const docValidatorWithoutRequired = new AjvValidator(schemaWithoutRequired);
const validateDataWithoutRequired = docValidatorWithoutRequired.validateData.bind(docValidatorWithoutRequired);


// 直接获取 RxDB 集合实例
async function getRxdbCollectionInstance() {
    return await getRxdbCollection('doc_indexes', doc_indexes_schema, migrationStrategies);
}

// 导出 validateData 和 validateField 方法
export { getRxdbCollectionInstance, validateData, validateField, validateDataWithoutRequired, doc_indexes_schema };
