export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getWordOfTheDay(wordList, date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  const index = dayOfYear % wordList.length;
  return wordList[index];
}