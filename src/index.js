import { DahuaCamera } from "./DahuaCameraService.js";
import { scanOpeningPortInNetwork } from "./scan-device.js";

const camera = new DahuaCamera("192.168.92.111", "admin", "Viact123");

(async () => {
  try {
    // const res = await camera.getNetworkSync();
    // if (res) {
    //   const newworkInfo = parseResponse2Object(res.data);
    //   const rtspInfoRes = await camera.getRtspConfigSync();
    //   const rtspInfo = parseResponse2Object(rtspInfoRes.data);
    //   //const setRtspRes = await camera.setRtspConfigSync(true, 554);
    //   console.log(rtspInfo);
    //   console.log(await camera.isOnlineAsync());
    // }
    scanOpeningPortInNetwork();
  } catch (error) {
    console.error(error);
  }
})();
