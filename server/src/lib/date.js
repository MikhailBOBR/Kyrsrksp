function getTimestamp() {
  return new Date().toISOString();
}

function getLocalDate(date = new Date()) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function addDays(baseDate, days) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return getLocalDate(date);
}

function getLastDates(baseDate, count) {
  return Array.from({ length: count }, (_, index) =>
    addDays(baseDate, index - (count - 1))
  );
}

module.exports = {
  addDays,
  getLastDates,
  getLocalDate,
  getTimestamp
};
