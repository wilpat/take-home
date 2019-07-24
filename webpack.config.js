const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: 'development',
  externals: {
      "fs": "require('fs')"
  },
  module:{
  	rules:[
  		{
  			test: /\.vue$/,//Look for anyfile that ends in .vue
  			use: 'vue-loader'//Then compile it to js using this loader
  		},
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        }
      }
  	]
  },
  plugins: [
	  new VueLoaderPlugin()
  ],
};