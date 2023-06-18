const jwt = require("jsonwebtoken");


export interface ManageAuthorizationRes {
  isAuthorized: boolean;
  token: string;
}

const verifyCallBack = (error, authorizedData) => {
  if (error) {
    throw new Error("Incorrect token. Do not have access to this operation.");
  } else {
    return authorizedData;
  }
};
const manageAuthorization = (
   authHeader: string,
  tokenSecret?: string,
): ManageAuthorizationRes => {
  if (tokenSecret) {
    jwt.verify(tokenSecret, process.env.SECRET, verifyCallBack); // returns the original data used to generate the token
    return { token: tokenSecret, isAuthorized: true };
  } else {
    const [user, password] = authHeader.split(':');
    if (user === process.env.USER && password === process.env.PASSWORD) {
      const token = jwt.sign(authHeader, process.env.SECRET);
      return { token, isAuthorized: true };
    } else {
      throw new Error("Incorrect token. Do not have access to this operation.");
    }
  }
};

export default manageAuthorization;
