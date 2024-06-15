// src\form\lib\rxdb\easy_io.js
class RxdbDocStores {
  constructor(moduleName = 'doc_indexes') {
    this.moduleName = moduleName;
    this.collection = null;
    this.validator = null;
    this.validateField = null;
  }

  async init() {
    const module = await this.loadModule(this.moduleName);
    this.validator = module.validateData;
    this.validateField = module.validateField;
    this.validateDataWithoutRequired = module.validateDataWithoutRequired;
    this.getRxdbCollectionInstance = module.getRxdbCollectionInstance;
  }
  
  async loadModule(moduleName) {
    const modules = import.meta.glob('./doc_*.js');
    const module = await modules[`./${moduleName}.js`]();
    return module;
  }

  async getCollection() {
    if (!this.collection) {
      this.collection = await this.getRxdbCollectionInstance();
    }
    return this.collection;
  }

  async add(docData) {
    const validationResult = await this.validator(docData);
    if (!validationResult.valid) {
      console.error('Validation failed:', validationResult.errors);
      throw new Error('Validation failed');
    }
    const collection = await this.getCollection();
    await collection.insert(docData);
  }

  async findById(id) {
    const collection = await this.getCollection();
    return await collection.findOne(id).exec();
  }

  async findByField(fieldName, value, limit = Number.MAX_SAFE_INTEGER) {
    const collection = await this.getCollection();
    return await collection.find().where(fieldName).eq(value).limit(limit).exec();
  }

  async queryStartsWith(fieldName, value, limit = 5) {
    const collection = await this.getCollection();
    const selector = fieldName === 'tags' ? 
        { [fieldName]: { $elemMatch: { $regex: `^${value}`, $options: 'i' } } } :
        { [fieldName]: { $regex: `^${value}`, $options: 'i' } };

    const results = await collection.find({ selector }).limit(limit).exec();
    return results.map(doc => doc.toJSON());
  }

}


let instances = {};

export async function getRxdbDocStores(moduleName) {
  if (!instances[moduleName]) {
    instances[moduleName] = new RxdbDocStores(moduleName);
    await instances[moduleName].init();
  }
  return instances[moduleName];
}

export default getRxdbDocStores;
