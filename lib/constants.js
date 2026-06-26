const config = {
  LOGOUT_EXPIRY: 1,
  MILLISECONDS_IN_A_DAY: 86400000,
};

const githubUrls = {
  PR_PATTERN: /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/,
};

const demoUrls = {
  EXAMPLE_COM: /^https?:\/\/(www\.)?example\.com/,
};

module.exports = {
  config,
  githubUrls,
  demoUrls,
};
