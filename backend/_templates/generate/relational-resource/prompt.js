module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'What is the singular resource name (e.g. invoice, order, project)?',
    validate: (val) => Boolean(val.trim()) || 'Resource name is required',
  },
];
