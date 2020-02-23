/// <binding AfterBuild='Run - Development' />
const path = require('path');

developmentConfig = {
	mode: 'production',
	devtool: 'source-map',
    optimization: {
        // We no not want to minimize our code.
        minimize: false
    },
    entry: {
        lookupfilter: './LookupFilter.ts'
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        library: 'MCS',
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    }
};

// This configuration will place the output minified file inside the main
// D365.WebResources project.
productionConfig = {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        // We no not want to minimize our code.
        minimize: true
    },
    entry: './LookupFilter.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        library: 'MCS',
        filename: 'lookupfilter.js',
        path: path.resolve(__dirname, 'dist')
    }
};

module.exports = [developmentConfig, productionConfig];