export default function scrollToBottom(scrollDiv: any) {
  // @ts-ignore-next-line
  const current = scrollDiv.current as HTMLElement;
  const el = document.getElementById("messages");

  const hasScrolled = el && el.scrollTop <= el.scrollHeight - el.offsetHeight;

  setTimeout(() => {
    if (current && !hasScrolled) {
      current.scrollTop = current.scrollHeight - 200;
    } else {
      console.log("No scrollDiv");
    }
  }, 0);
}
