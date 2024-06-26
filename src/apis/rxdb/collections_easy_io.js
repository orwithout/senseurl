// src\apis\rxdb\docs_easy_io.js
import _ from 'lodash';

class DocsEasyIo {
  constructor(moduleName = 'doc_store') {
    this.moduleName = moduleName;
    this.subscriptions = new WeakMap();
    this.debouncedUnsubscribe = _.debounce(this.unsubscribe.bind(this), 30000);
  }

  async init() {
    const modules = import.meta.glob('./collection_*.js');
    const {getCollection, validateData, validateField, validateWithoutRequired, docSchema} = await modules[`./${this.moduleName}.js`]();
    Object.assign(this, {validateData, validateField, validateWithoutRequired, docSchema });
    this.collection = await getCollection();
  }
  
  async add(docData) {
    const validationResult = await this.validateData(docData);
    if (!validationResult.valid) {
      console.error('Validation failed:', validationResult.errors);
      throw new Error('Validation failed');
    }
    return this.collection.insert(docData);
  }

  findById(id) {
    return this.collection.findOne(id).exec();
  }

  findByField(fieldName, value, limit = Number.MAX_SAFE_INTEGER) {
    return this.collection.find().where(fieldName).eq(value).limit(limit).exec();
  }

  getSchemaProperties(fieldPath) {
    const pathParts = fieldPath.split('.');
    let currentSchema = _.get(this.docSchema, 'properties');
    for (const part of pathParts) {
      if (_.get(currentSchema, [part, 'type']) === 'array') {
        return {
          isArray: true,
          itemProperties: _.get(currentSchema, [part, 'items', 'properties'])
        };
      }
      currentSchema = _.get(currentSchema, [part, 'properties']);
      if (!currentSchema) return { isArray: false, itemProperties: null };
    }
    return { isArray: false, itemProperties: currentSchema };
  }

  async queryStartsWith(fieldPath, value, limit = 5) {
    const { isArray, itemProperties } = this.getSchemaProperties(fieldPath);
  
    let selector;
    if (isArray) {
      if (itemProperties) {
        const searchableProperties = _.filter(_.keys(itemProperties), prop => 
          ['string', 'number'].includes(_.get(itemProperties, [prop, 'type']))
        );
        selector = {[fieldPath]: {$elemMatch: {$or: searchableProperties.map(prop => ({[prop]: { $regex: `^${value}`, $options: 'i' }}))}}};
      } else {
        selector = {[fieldPath]: { $elemMatch: { $regex: `^${value}`, $options: 'i' } }};
      }
    } else {
      selector = { [fieldPath]: { $regex: `^${value}`, $options: 'i' } };
    }
  
    const results = await this.collection.find({ selector }).limit(limit).exec();
    return _.map(results, doc => doc.toJSON());
  }

  subscribeToChanges(query = {}, callback) {
    const key = {};
    const subscription = this.collection.find(query).$.subscribe(results => {
      callback(results);
      this.debouncedUnsubscribe.cancel();  // 取消之前的延迟取消
      this.debouncedUnsubscribe(key);  // 重新设置延迟取消
    });
  
    this.subscriptions.set(key, subscription);
  
    return key;
  }
  
  unsubscribe(key) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
      console.log('订阅已取消');
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((_, key) => this.unsubscribe(key));
    console.log('所有订阅已取消');
  }
}

const instances = {};

export async function getDocsEasyIo(moduleName) {
  if (!instances[moduleName]) {
    instances[moduleName] = new DocsEasyIo(moduleName);
    await instances[moduleName].init();
  }
  return instances[moduleName];
}

export default getDocsEasyIo;