export default function scrollToBottom(scrollDiv?: any) {
  console.log("Scroll function called");
  // Scroll to "scroll-anchor"
  const scrollAnchor = document.getElementById("scroll-anchor");
  if (scrollAnchor) {
    setTimeout(() => {
      scrollAnchor.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  } else {
    console.error("scroll-anchor not found");
  }
}
