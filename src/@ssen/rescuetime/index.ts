export function parseTimeStringToSeconds(text: string): number {
  const hour = /([0-9]+)h/.exec(text);
  const minutes = /([0-9]+)m/.exec(text);
  const seconds = /([0-9]+)s/.exec(text);

  return (
    (hour ? parseInt(hour[1], 10) * 60 * 60 : 0) +
    (minutes ? parseInt(minutes[1], 10) * 60 : 0) +
    (seconds ? parseInt(seconds[1], 10) : 0)
  );
}
