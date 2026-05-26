import { setOldLoading } from "../client";
export const isLowMemory = () => {
  if (
    /Web0S|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Nintendo|Opera Mini/i.test(
      navigator.userAgent,
    )
  ) {
    setOldLoading(true);
  }
};
