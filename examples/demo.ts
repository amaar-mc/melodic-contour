import { cseg, comMatrix, cas, casVector, csim, cint, equivalenceClass } from "../src/index.js";

const pitches = [60, 67, 62, 64];
console.log("Pitches:", pitches);

const c = cseg(pitches);
console.log("CSeg:", c); // [0, 3, 1, 2]

console.log("COM Matrix:");
const com = comMatrix(c);
for (const row of com) {
  console.log(" ", row);
}

console.log("CAS:", cas(c)); // [1, -1, 1]
console.log("CAS Vector:", casVector(c)); // [2, 1]

console.log("CSIM with itself:", csim(c, c)); // 1

console.log("CINT Matrix:");
const ci = cint(c);
for (const row of ci) {
  console.log(" ", row);
}

console.log("Equivalence Class:");
for (const form of equivalenceClass(c)) {
  console.log(" ", form);
}
