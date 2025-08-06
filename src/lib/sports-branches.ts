// Centralized sports branches configuration
// This file ensures consistency across all modules (athletes, coaches, trainings)

export const SPORTS_BRANCHES = [
  "Basketbol",
  "Hentbol", 
  "Yüzme",
  "Akıl ve Zeka Oyunları",
  "Satranç",
  "Hareket Eğitimi",
  "Yoga",
  "Pilates",
  "Cimnastik"
] as const;

export type SportsBranch = typeof SPORTS_BRANCHES[number];

// Helper function to get sports branches array
export const getSportsBranches = (): readonly string[] => {
  return SPORTS_BRANCHES;
};

// Helper function to validate if a sport branch exists
export const isValidSportsBranch = (branch: string): branch is SportsBranch => {
  return SPORTS_BRANCHES.includes(branch as SportsBranch);
};

// Helper function to get sports branches for select components
export const getSportsBranchesForSelect = () => {
  return SPORTS_BRANCHES.map(branch => ({
    value: branch,
    label: branch
  }));
};