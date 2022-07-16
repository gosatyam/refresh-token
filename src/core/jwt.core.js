const jwt = require("jsonwebtoken");

function signJwt(object, keyName, options) {
  const signingKey =
    keyName === "accessTokenPrivateKey"
      ? process.env.ACCESS_TOKEN_PRIVATE_KEY
      : process.env.REFRESH_TOKEN_PRIVATE_KEY;
  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

function verifyJwt(token, keyName) {
  const publicKey =
    keyName === "accessTokenPublicKey"
      ? process.env.ACCESS_TOKEN_PUBLIC_KEY
      : process.env.REFRESH_TOKEN_PUBLIC_KEY;
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}

module.exports = { signJwt, verifyJwt };
