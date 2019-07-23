const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: 'development',
  module:{
  	rules:[
  		{
  			test: /\.vue$/,//Look for anyfile that ends in .vue
  			use: 'vue-loader'//Then compile it to js using this loader
  		}
  	]
  },
  plugins: [
	  new VueLoaderPlugin()
  ],
};