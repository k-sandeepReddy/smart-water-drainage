/**
 * Rule-Based Priority System (Client-Side Mirror)
 * Evaluates priority in real time to give residents immediate feedback
 * matching backend/priority.py rules.
 */

export function calculatePriorityPreview(category, problemType, description) {
  const text = `${category || ''} ${problemType || ''} ${description || ''}`.toLowerCase();

  const highKeywords = [
    'severe', 'burst', 'contamination', 'contaminated', 'dirty water',
    'no water for', 'blocked major drain', 'major drain', 'sewage backup',
    'drain overflow', 'sewage overflow', 'stagnant water near homes', 'mosquito breeding', 'dengue',
    'malaria', 'flooding', 'flooded', 'submerged', 'hazard', 'health crisis',
    'choked main drain', 'foul smell inside home'
  ];

  if ((category || '').toLowerCase() === 'garbage') {
    return 'Medium';
  }

  if ((category || '').toLowerCase() === 'stagnant water' && 
      (text.includes('near home') || text.includes('mosquito') || text.includes('smell') || text.includes('fever') || text.includes('dengue'))) {
    return 'High';
  }

  if ((category || '').toLowerCase() === 'drainage' &&
      (text.includes('flood') || text.includes('overflow') || text.includes('choked') || text.includes('sewage') || text.includes('major'))) {
    return 'High';
  }

  if ((category || '').toLowerCase() === 'water supply' &&
      (text.includes('no water') || text.includes('burst') || text.includes('dirty') || text.includes('contaminated') || text.includes('severe'))) {
    return 'High';
  }

  for (const kw of highKeywords) {
    if (text.includes(kw)) {
      return 'High';
    }
  }

  const mediumKeywords = [
    'accumulate', 'accumulation', 'trash', 'waste', 'minor drain',
    'slow drainage', 'irregular', 'low pressure', 'leak', 'leakage',
    'cleaning needed', 'clogged small drain'
  ];

  for (const kw of mediumKeywords) {
    if (text.includes(kw)) {
      return 'Medium';
    }
  }

  if (['drainage', 'stagnant water', 'garbage', 'water supply'].includes((category || '').toLowerCase())) {
    return 'Medium';
  }

  return 'Low';
}
