import { nhost } from "../libs/nhost";

export default async function checkSafeImage(image: File) {
  const url = await uploadImageToCDN(image);

  return fetch("/api/safe-image", {
    method: "POST",
    body: JSON.stringify({
      image: url,
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then(async (res) => {
      await nhost.storage.delete({ fileId: url.split("/").pop() as string });
      return res.json();
    })
    .then((res) => {
      const { adult, violence, racy } = res.safe;
      if (isNSFW(adult) || isNSFW(violence) || isNSFW(racy)) {
        return false;
      } else {
        return true;
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function uploadImageToCDN(image: File) {
  const fileId = await nhost.storage
    .upload({
      file: image,
    })
    .then((res) => {
      return res.fileMetadata?.id;
    })
    .catch((err) => {
      throw err;
    });

  return nhost.storage.getPublicUrl({ fileId: fileId as string });
}

function isNSFW(data: string) {
  if (data === "LIKELY" || data === "POSSIBLE" || data === "VERY_LIKELY") {
    return true;
  } else {
    return false;
  }
}
