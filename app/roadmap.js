// roadmap.js — one job: the platinum roadmap, built from the official descriptions.
// Three steps follow PowerPyx's roadmap (story 60-80h, 100% checklist ~100h,
// Strangers & Freaks + cleanup ~10h). Each stage names the trophies it covers,
// so the stage counters below are computed from the same data as the checklist.
export const ROADMAP_STAGES = [
  {
    id: 'story',
    title: 'Step 1 — Story + side missions',
    hours: '60–80 h',
    text: 'Play the story (5 chapters) and pick up optional missions as they appear: purple icons, plus black icons with pink letters. Scan every new vehicle with the WAiNK app and study animals through your binoculars — 100% needs 200 of the 277 vehicle models and 100 of the 255 animals, and studying is enough.',
    note: 'Do the Chapter 1 balcony meditation with Lucia before leaving Chapter 1 (see Positive Mental Attitude).',
    trophyNames: [
      'Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!',
      'Top Of The World, Ma', 'You Gotta Know When to Get Off', 'Trust', 'Break the Bank',
      'Family Matters', 'DWNFALL', 'Hi-Jacked', 'Snow Storm',
      'Road to Rehabilitation', 'This Was No Boat Accident', 'The Lone Rider',
      'Supply & Demand', 'Spin On This!', 'Baited My Tackle', 'Positive Mental Attitude',
    ],
  },
  {
    id: 'checklist',
    title: 'Step 2 — 100% checklist + Challenges',
    hours: '~100 h',
    text: 'After the ending, Progress > Stats gains a 100% Completion entry. It is closer to 60% true completion: most side quests are not required and collectibles only partly. You do need every robbery, every underwater discovery, every shooting range, every drone race and the Bret quest. Only 70 of the 80 Challenges are needed, so skip the nastiest 10.',
    note: 'Everything you did during the story already counts toward the checklist.',
    trophyNames: [
      'A Long Road', 'Cunning Stunts', 'The Shootist', 'Top Fun', 'Earn Cash, Not Kudos',
      'One Last Thing', 'Whip It Good', 'The Goodtime State', 'Don\'t Touch My Deck',
      'You WAiNKer!', 'Hot Together', 'Retail Therapy', 'Sneakthief', 'Maximum Withdrawal',
      'A Classic Blitz Play', 'Pest Control', 'Dime on the Dollar', 'Treat Yo Self',
      'Little Boxes', 'On the Spot', 'Gunslinger', 'Catch Me If You Can', 'Challenging Tank',
      'Fair Game', 'Actions Speak Louder',
    ],
  },
  {
    id: 'cleanup',
    title: 'Step 3 — Strangers & Freaks + cleanup',
    hours: '~10 h',
    text: 'The checklist does not ask for the Strangers & Freaks strands, so they are usually what is left afterwards, together with any stray trophies that did not pop on their own. Every quest giver tied to a trophy is still around in free roam after the ending.',
    note: 'Finish the 8 stranger strands, then the unsolved hidden trophies as their triggers are confirmed.',
    trophyNames: [
      'Strangers & Freaks', 'Master of None', 'Stick Fiddler', 'Let’s Go Bowling',
      'Personal Best', 'In The Beginning…', 'Capital Offense', 'Bad Luck, I Guess',
      'The Truth Is Out There', 'Ten Pin',
    ],
  },
];

export function renderRoadmap(host, trophies, earned) {
  const byName = new Map(trophies.map((t) => [t.name, t]));
  host.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const mine = stage.trophyNames.map((n) => byName.get(n)).filter(Boolean);
    const done = mine.filter((t) => earned.has(t.name)).length;
    const box = document.createElement('div');
    box.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const hours = document.createElement('span');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    h.append(hours);
    const p = document.createElement('p');
    p.textContent = stage.text;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} / ${mine.length} trophies in this step${mine.length - done > 0 ? ` — ${mine.length - done} still to earn` : ' — step complete'}`;
    const note = document.createElement('p');
    note.textContent = stage.note;
    const ul = document.createElement('ul');
    for (const t of mine) {
      const li = document.createElement('li');
      li.textContent = `${earned.has(t.name) ? '✓ ' : '· '}${t.name} (${t.grade})`;
      ul.append(li);
    }
    box.append(h, p, count, note, ul);
    host.append(box);
  }
}
