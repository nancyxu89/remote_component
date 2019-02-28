module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  rules: {
    // allow paren-less arrow functions
    "arrow-parens": 0,
    // allow async-await
    "generator-star-spacing": 0,
    "no-extra-semi": 2,
    // 禁止使用分号
    // semi: [2, "never"],
    // 强制分号之前和之后使用一致的空格
    "semi-spacing": 0,
    "no-unused-vars": [2, { vars: "all", args: "after-used" }],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
