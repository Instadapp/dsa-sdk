module.exports = {
  presets: [
    [
      "@babel/preset-env", {
        "targets": {
          "node": "current"
        }
      }
    ],
    ["minify", {
      // https://github.com/babel/minify/issues/904
      builtIns: false,
      evaluate: false,
      mangle: false,
      "keepFnName": true
    }]
  ],
  plugins: [
    ["@babel/plugin-proposal-class-properties"]
  ]
};
