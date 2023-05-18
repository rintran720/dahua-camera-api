import { scanDevice } from "./ScanDevice.util.js";

(async () => {
  try {
    console.log(await scanDevice("admin", "Viact123"));
  } catch (error) {
    console.error(error);
  }
})();
