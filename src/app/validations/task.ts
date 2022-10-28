export {};
const { param, body } = require('express-validator');

const show = [param('id').notEmpty()];

const store = [body(['boardId', 'title']).notEmpty()];

const update = [
  param('id').notEmpty().isString(),
  body('title').if(body('title').exists()).isString().isLength({ min: 1 }),
];

const remove = [param('id').notEmpty().isString()];

module.exports = {
  show,
  store,
  update,
  remove,
};
