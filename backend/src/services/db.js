// Minimal DB placeholder. Replace with pg client in production.
module.exports = {
  query: async (...args) => { return { rows: [] }; }
};
