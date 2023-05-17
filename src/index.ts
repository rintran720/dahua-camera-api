import AXIOS, { AxiosInstance } from "axios";
import crypto from "crypto";

const axios = AXIOS.create({});
const username = "admin";
const password = "Viact123";
const baseURL = "http://192.168.92.111/";
const url = "/magicBox.cgi?action=getLanguageCaps";

/**
 * TODO: function to generate digest header
 * @param method the method of request e.g. GET, POST, PUT
 * @param path the path to request
 * @param nonce the nonce of the request
 * @param realm the realm of device
 */
const generateDigestHeader = (
  method: string,
  path: string,
  nonce: string,
  realm: string
) => {
  const qop = "auth";
  const ha1 = crypto
    .createHash("md5")
    .update(`${username}:${realm}:${password}`)
    .digest("hex");

  const ha2 = crypto
    .createHash("md5")
    .update(`${method}:${path}`)
    .digest("hex");

  const nc = "00000001";
  const cnonce = crypto.randomBytes(8).toString("hex");
  const digest = crypto
    .createHash("md5")
    .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    .digest("hex");

  return `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${path}", qop="${qop}", nc=${nc}, cnonce="${cnonce}", response="${digest}"`;
};

// GET request to get nonce and realm from the server
// axios
//   .get(url)
//   .catch(({ response }) => {
//     // extract nonce and realm from WWW-Authenticate header
//     const authenticateHeader = response.headers["www-authenticate"];
//     const match1 = authenticateHeader.match(/realm="(.*?)"/);
//     const match2 = authenticateHeader.match(/nonce="(.*?)"/);
//     const realm = match1[1];
//     const nonce = match2[1];

//     // generate digest authorization header
//     const path = "/cgi-bin/magicBox.cgi?action=getLanguageCaps";
//     const method = "GET";
//     const header = generateDigestHeader(method, path, nonce, realm);

//     // send second GET request with authorization header
//     return axios.get(url, {
//       headers: { Authorization: header },
//     });
//   })
//   .then((response) => {
//     console.log(response.data);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

class DahuaAuthenticator {
  public ip: string;
  public username: string;
  public password: string;
  public axios: AxiosInstance;

  constructor(ip: string, username: string, password: string) {
    this.ip = ip;
    this.username = username;
    this.password = password;

    this.axios = AXIOS.create({
      baseURL: this.ip,
      timeout: 10000,
    });

    this.axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        console.log(error.response);
        if (error.response?.data?.message) {
          return Promise.reject(error);
        }
      }
    );
  }
}

const da = new DahuaAuthenticator("192.168.92.111", "admin", "Viact123");

da.axios
  .get(url)
  .then((response) => {
    console.log("response");
  })
  .catch((error) => {
    console.error("error");
  });
