const config = {
  LOGOUT_EXPIRY: 1,
  MILLISECONDS_IN_A_DAY: 86400000,
};

const githubUrls = {
  PR_PATTERN: /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/,
};

module.exports = {
  config,
  githubUrls,
};
