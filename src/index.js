import { DahuaCamera } from "./DahuaCamera.service.js";
import { scanOpeningPortInNetwork } from "./ScanDevice.util.js";

const camera = new DahuaCamera("192.168.92.111", "admin", "Viact123");

(async () => {
  try {
    // const res = await camera.getNetworkSync();
    // if (res) {
    //   const networkInfo = parseResponse2Object(res.data);
    //   const rtspInfoRes = await camera.getRtspConfigSync();
    //   const rtspInfo = parseResponse2Object(rtspInfoRes.data);
    //   // const setRtspRes = await camera.setRtspConfigSync(true, 554);
    //   console.log(rtspInfo);
    //   console.log(await camera.isOnlineAsync());
    // }
    console.log(await scanOpeningPortInNetwork());
  } catch (error) {
    console.error(error);
  }
})();
