// doc_io_query.js
import { getMetaCollection, metaSchema } from './doc_meta.js';
import _ from 'lodash';


export async function docQueryStartsWith(fieldName, value, limit = Number.MAX_SAFE_INTEGER) {
  const metaCollection = await getMetaCollection();
  const regexPattern = `^${value}`;
  // 直接构建字符串形式的正则表达式
  const results = await metaCollection.find()
                      .where(fieldName)
                      .regex(regexPattern, 'i') // 使用字符串和选项
                      .limit(limit)
                      .exec();
  return results.map(doc => doc.toJSON());
}








export async function docFindInRange(fieldName, start, end, limit = Number.MAX_SAFE_INTEGER) {
  const metaCollection = await getMetaCollection();
  return metaCollection.find().where(fieldName).gte(start).lte(end).limit(limit).exec();
}




export async function docFindByField(fieldName, value, limit = Number.MAX_SAFE_INTEGER) {
  const metaCollection = await getMetaCollection();
  return metaCollection.find().where(fieldName).eq(value).limit(limit).exec();
}


