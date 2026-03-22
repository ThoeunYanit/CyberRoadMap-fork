const TRAITS = ['offensive', 'defensive', 'analytical', 'research', 'social', 'builder'];

const QUESTION_TRAIT_MAP = [
  // Q1: When you watch a crime documentary, what interests you most?
  {
    A: { research: 2, analytical: 1 },
    B: { offensive: 2, analytical: 1 },
    C: { analytical: 2, defensive: 1 },
    D: { defensive: 2, builder: 1 },
    E: null,
  },
  // Q2: A friend's account got hacked. Your first reaction?
  {
    A: { research: 2, analytical: 1 },
    B: { offensive: 2, analytical: 1 },
    C: { analytical: 2, defensive: 1 },
    D: { defensive: 2, builder: 1 },
    E: null,
  },
  // Q3: You find an unlocked door in your workplace. What do you do?
  {
    A: { research: 2, analytical: 1 },
    B: { offensive: 2, research: 1 },
    C: { analytical: 2, builder: 1 },
    D: { defensive: 2, builder: 1 },
    E: null,
  },
  // Q4: Which school subject felt most natural to you?
  {
    A: { research: 3, analytical: 1 },
    B: { offensive: 2, analytical: 1 },
    C: { analytical: 3, defensive: 1 },
    D: { defensive: 2, builder: 2 },
    E: null,
  },
  // Q5: If you were a detective, what type of cases would you want?
  {
    A: { research: 3, analytical: 1 },
    B: { offensive: 2, social: 2 },
    C: { analytical: 3, defensive: 1 },
    D: { defensive: 2, builder: 2 },
    E: null,
  },
  // Q6: Your group is planning a surprise party. What role do you take?
  {
    A: { research: 2, analytical: 1 },
    B: { offensive: 1, social: 3 },
    C: { analytical: 2, builder: 2 },
    D: { defensive: 2, social: 1 },
    E: null,
  },
  // Q7: You discover a strange business in your neighborhood. What do you do?
  {
    A: { research: 3, analytical: 1 },
    B: { offensive: 2, social: 1 },
    C: { analytical: 2, builder: 1 },
    D: { defensive: 2, builder: 1 },
    E: null,
  },
  // Q8: Which superpower would you choose?
  {
    A: { research: 3, analytical: 1 },
    B: { offensive: 3, analytical: 1 },
    C: { analytical: 3, defensive: 1 },
    D: { defensive: 3, builder: 1 },
    E: null,
  },
  // Q9: When playing a video game, which style do you prefer?
  {
    A: { research: 2, analytical: 2 },
    B: { offensive: 3, analytical: 1 },
    C: { analytical: 3, defensive: 1 },
    D: { defensive: 2, builder: 3 },
    E: null,
  },
  // Q10: What kind of books or movies do you prefer?
  {
    A: { research: 3, social: 1 },
    B: { offensive: 2, social: 2 },
    C: { analytical: 3, defensive: 1 },
    D: { defensive: 2, builder: 2 },
    E: null,
  },
  // Q11: You notice something unusual on your computer. What do you do?
  {
    A: { research: 2, analytical: 1 },
    B: { offensive: 2, analytical: 2 },
    C: { analytical: 3, defensive: 1 },
    D: { defensive: 3, builder: 1 },
    E: null,
  },
  // Q12: Which job outside tech sounds most like you?
  {
    A: { research: 3, social: 1 },
    B: { offensive: 2, social: 2 },
    C: { analytical: 3, defensive: 1 },
    D: { defensive: 3, builder: 2 },
    E: null,
  },
];

module.exports = { TRAITS, QUESTION_TRAIT_MAP };