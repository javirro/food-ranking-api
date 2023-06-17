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
    const data = jwt.verify(tokenSecret, process.env.SECRET, verifyCallBack);
    return { token: tokenSecret, isAuthorized: true };
  } else {
    const [user, password] = authHeader.split[':'];
    const usersEnabled = process.env.users;

    if (usersEnabled.includes(user) && password === process.env.password) {
      const token = jwt.sign(user, process.env.SECRET, { expiresIn: "1h" });
      return { token, isAuthorized: true };
    } else {
      throw new Error("Incorrect token. Do not have access to this operation.");
    }
  }
};

export default manageAuthorization;
