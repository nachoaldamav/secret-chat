export default function scrollToBottom(scrollDiv?: any) {
  // Scroll to "scroll-anchor"
  const scrollAnchor = document.getElementById("scroll-anchor");
  if (scrollAnchor) {
    scrollAnchor.scrollIntoView({ behavior: "smooth" });
  } else {
    console.error("scroll-anchor not found");
  }
}
