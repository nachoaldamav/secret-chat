export default async function getImageDimensions(url: string) {
  const { width, height } = await fetch(
    `/api/get-dimensions?url=${encodeURIComponent(url)}`
  )
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      throw err;
    });
  return { width, height };
}
