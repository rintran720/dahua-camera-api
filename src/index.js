import AXIOS from "axios";
import crypto from "crypto";
import net from "net";

const username = "admin";
const password = "Viact123";

/**
 * TODO: function to generate digest header
 * @param method the method of request e.g. GET, POST, PUT
 * @param path the path to request
 * @param nonce the nonce of the request
 * @param realm the realm of device
 *
 * @returns {string} the digest header
 */
const generateDigestHeader = (method, path, nonce, realm) => {
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

/**
 * TODO: parse Dahua response to JS Object
 * @param response the string of Dahua response
 *
 * @returns {Object} Response Object
 */
const parseResponse2Object = (response) => {
  const result = response
    ?.trim()
    .split("\n")
    .reduce((acc, curr) => {
      const [key, value] = curr.split("=");

      const path = key.split(".");
      let obj = acc;

      // Create a new path object.
      for (let i = 0; i < path.length; i++) {
        // Add a path to the path array.
        if (!obj[path[i]]) {
          obj[path[i]] = {};
        }
        // Set the value of the path i th path element.
        if (i === path.length - 1) {
          // Set the path property of the object.
          if (value.includes("[")) {
            const [vKey, vValue] = value.split("=");
            const index = parseInt(vKey.match(/\[(\d+)\]/)[1], 10);
            obj[path[i]][vKey.replace(`[${index}]`, "")] = vValue;
          } else {
            obj[path[i]] = value;
          }
        }
        obj = obj[path[i]];
      }

      return acc;
    }, {});

  return result;
};

function isPortOpen(port, host, callback) {
  const client = new net.Socket();

  client.connect(port, host, function () {
    client.destroy();
    callback(null, true);
  });

  client.on("error", function (err) {
    client.destroy();
    if (err.code === "ECONNREFUSED") {
      callback(null, false);
    } else {
      callback(err);
    }
  });
}

class DahuaCameraService {
  /**
   * TODO: create new DahuaCameraService instance
   * @param ip
   * @param username
   * @param password
   *
   * @return { DahuaCameraService }
   */
  constructor(ip, username, password) {
    this.ip = ip;
    this.baseURL = `http://${ip}`;
    this.username = username;
    this.password = password;

    this.axios = AXIOS.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });

    this.axios.interceptors.response.use(
      (res) => res,
      async ({ code, response, config }) => {
        // Returns Promise. reject if connection is not established.
        if (code === "ECONNABORTED") {
          return Promise.reject(new Error("Can not connect this device"));
        }

        // Returns a promise that resolves to the response.
        if (response.status === 401) {
          const originalRequest = { ...config };
          // extract nonce and realm from WWW-Authenticate header
          const authenticateHeader = response.headers["www-authenticate"];
          const match1 = authenticateHeader.match(/realm="(.*?)"/);
          const match2 = authenticateHeader.match(/nonce="(.*?)"/);
          const realm = match1[1];
          const nonce = match2[1];

          // generate digest authorization header
          const path = config.url;
          const method = "GET";
          const digestHeader = generateDigestHeader(method, path, nonce, realm);
          originalRequest.headers["Authorization"] = digestHeader;

          return this.axios(originalRequest);
          // Promise. resolve rejects if response status is less than 300.
        } else if (response.status < 300) {
          return Promise.reject(error);
        } else {
          return Promise.resolve(response);
        }
      }
    );
  }

  async isOnlineAsync() {
    try {
      const result = await new Promise((resolve, reject) => {
        isPortOpen(80, this.ip, function (err, isOpen) {
          if (err) {
            reject(`Error checking port status: ${err.message}`);
          } else if (isOpen) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });

      return result;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @return { Promise } A promise that resolves when the network sync is complete or rejects with an error message. The promise's value is an object with the following properties
   */
  getNetworkSync() {
    return this.axios.get(
      "/cgi-bin/configManager.cgi?action=getConfig&name=Network"
    );
  }
  /**
   * @return { Promise } A promise that resolves to RTSP configuration or rejects with an error message. The promise's value is an object with the following properties
   */
  getRtspConfigSync() {
    return this.axios.get(
      "/cgi-bin/configManager.cgi?action=getConfig&name=RTSP"
    );
  }
  /**
   * TODO: set rtsp config for the camera
   * @param enable
   * @param port
   *
   * @return { Promise } A promise that resolves when the request completes. Rejects if the CGI request fails or is not responsive
   */
  setRtspConfigSync(enable, port) {
    return this.axios.get(
      `/cgi-bin/configManager.cgi?action=setConfig&RTSP.Enable=${Boolean(
        enable
      )}&RTSP.Port=${Number(port)}`
    );
  }
}

const da = new DahuaCameraService("192.168.92.111", "admin", "Viact123");

(async () => {
  try {
    const res = await da.getNetworkSync();
    if (res) {
      const newworkInfo = parseResponse2Object(res.data);
      const rtspInfoRes = await da.getRtspConfigSync();
      const rtspInfo = parseResponse2Object(rtspInfoRes.data);
      //const setRtspRes = await da.setRtspConfigSync(true, 554);
      console.log(rtspInfo);
      console.log(await da.isOnlineAsync());
    }
  } catch (error) {
    console.error(error);
  }
})();
