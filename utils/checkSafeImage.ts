export default async function checkSafeImage(image: File) {
  // "api/safe-image"
  const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
  console.log(base64);
  return fetch("/api/safe-image", {
    method: "POST",
    body: JSON.stringify({
      image: base64,
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((res) => {
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

function isNSFW(data: string) {
  if (data === "LIKELY" || data === "POSSIBLE" || data === "VERY_LIKELY") {
    return true;
  } else {
    return false;
  }
}
