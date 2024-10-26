let resolve = (dir) => path.join(__dirname, dir);
module.exports = {
  resolve: {
    alias: {
      '@': resolve('/')
    }
  }
};
