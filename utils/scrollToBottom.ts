export default function scrollToBottom(scrollDiv: any) {
  // @ts-ignore-next-line
  const current = scrollDiv.current as HTMLElement;

  setTimeout(() => {
    if (current) {
      current.scrollTop = current.scrollHeight - 100;
    } else {
      console.log("No scrollDiv");
    }
  }, 0);
}
