export default function timeAgo(date: Date) {
  const currentDate = new Date();
  const diff = currentDate.getTime() - date.getTime();
  const diffSeconds = Math.floor(diff / 1000);
  const diffMinutes = Math.floor(diff / 60000);
  const diffHours = Math.floor(diff / 3600000);

  if (diffSeconds < 60) {
    return "Ahora";
  }
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} minuto${diffMinutes === 1 ? "" : "s"}`;
  }
  if (diffHours < 24) {
    return date.toLocaleTimeString("es-ES", {
      hour: "numeric",
      minute: "numeric",
    });
  }

  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString("es-ES", {
      hour: "numeric",
      minute: "numeric",
    })
  );
}
