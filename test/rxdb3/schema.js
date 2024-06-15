// index\schema.js
import Validator from './validator.js';


const schema = {
  type: 'object',
  properties: {
      tags: {type: 'array',items: { type: 'string' },preprocess: 'tags'},
      description: {type: 'number'}
  },
  required: ['tags', 'description']
};




const documentValidator = new Validator(schema);

export default documentValidator;
