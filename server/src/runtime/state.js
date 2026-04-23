let draining = false;

function isDraining() {
  return draining;
}

function setDraining(value) {
  draining = Boolean(value);
}

module.exports = {
  isDraining,
  setDraining
};
