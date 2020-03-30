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
      "keepFnName": true
    }]
  ],
  plugins: [
    ["@babel/plugin-proposal-class-properties"]
  ]
};