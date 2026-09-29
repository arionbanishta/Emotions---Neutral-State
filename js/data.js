/* ==========================================================================
   Emotion Wheel — data
   --------------------------------------------------------------------------
   EMOTIONS  The wheel itself, listed clockwise starting at 12 o'clock.
             Core emotions are objects; the rings inside are
             [name, description, children] tuples.

   CONTENT   Extra content per emotion, keyed by emotion id.
             An id is the path of names in lower case, joined by "/":
               "happy", "happy/content", "happy/content/joyful"
             Any field that is missing falls back to the parent emotion,
             so content added to "happy" also shows for "happy/content/joyful"
             until that emotion gets its own.

             Fields (all optional):
               insight   { quote: '...', author: '...' }
               formula   'Happiness ≥ Reality − Expectations'
               regulate  One line under "Regulate / learn more"
               video     'videos/happy.mp4'  or  { src: '...', poster: '...' }
               audio     { src: 'audio/happy.mp3' }  → plays this file for "Nature sound"
                         { music: true }            → adds the soft generated melody
               f / m     Overrides for the female / male version, e.g.
                         f: { video: 'videos/happy-f.mp4' }
   ========================================================================== */

window.EMOTIONS = [
  {
    name: 'Fearful', color: '#1BA6C3',
    desc: 'A sense of danger or threat, real or imagined, that puts you on alert.',
    children: [
      ['Scared', 'Afraid of something that could hurt you.', [
        ['Helpless', 'Unable to act or protect yourself.'],
        ['Frightened', 'A sudden, strong wave of fear.']]],
      ['Anxious', 'Uneasy worry about what might happen.', [
        ['Overwhelmed', 'Feeling there is more than you can handle.'],
        ['Worried', 'Thoughts circling around possible problems.']]],
      ['Insecure', 'Doubting yourself and your place.', [
        ['Inadequate', 'Feeling you are not enough for what is asked of you.'],
        ['Inferior', 'Feeling less than others.']]],
      ['Weak', 'Feeling you lack the strength to cope.', [
        ['Worthless', 'Feeling you have no value.'],
        ['Insignificant', 'Feeling small and unimportant.']]],
      ['Rejected', 'Pushed away or unwanted.', [
        ['Excluded', 'Left out of the group.'],
        ['Persecuted', 'Targeted or treated unfairly, again and again.']]],
      ['Threatened', 'Sensing that something is putting you at risk.', [
        ['Nervous', 'Restless tension before something uncertain.'],
        ['Exposed', 'Seen and unprotected.']]]
    ]
  },
  {
    name: 'Angry', color: '#7572C4',
    desc: 'A strong reaction to something that feels wrong, unfair, or in your way.',
    children: [
      ['Let down', 'Disappointed by someone you relied on.', [
        ['Betrayed', 'Hurt by a broken trust.'],
        ['Resentful', 'Holding on to bitterness about being wronged.']]],
      ['Humiliated', 'Feeling your dignity was taken from you.', [
        ['Disrespected', 'Feeling your worth was ignored.'],
        ['Ridiculed', 'Mocked or made fun of.']]],
      ['Bitter', 'Lingering anger that has turned sour.', [
        ['Indignant', 'Angry at something that feels unjust.'],
        ['Violated', 'Feeling your boundaries were crossed.']]],
      ['Mad', 'Plain, heated anger.', [
        ['Furious', 'Intense anger that is hard to contain.'],
        ['Jealous', 'Afraid of losing something or someone to another.']]],
      ['Aggressive', 'Anger pushing toward attack or confrontation.', [
        ['Provoked', 'Deliberately stirred up to react.'],
        ['Hostile', 'Unfriendly and ready for conflict.']]],
      ['Frustrated', 'Blocked from what you want or need.', [
        ['Infuriated', 'Frustration that has boiled over.'],
        ['Annoyed', 'Mild, nagging irritation.']]],
      ['Distant', 'Pulling away to protect yourself.', [
        ['Withdrawn', 'Closing off from the people around you.'],
        ['Numb', 'Shut down, unable to feel much at all.']]],
      ['Critical', 'Focused on faults and what is wrong.', [
        ['Sceptical', 'Doubtful and unwilling to believe.'],
        ['Dismissive', 'Brushing something off as not worth attention.']]]
    ]
  },
  {
    name: 'Disgusted', color: '#AD7BC2',
    desc: 'A strong urge to turn away from something unpleasant or offensive.',
    children: [
      ['Disapproving', 'Judging something as wrong or unacceptable.', [
        ['Judgmental', 'Quick to form a harsh opinion.'],
        ['Embarrassed', 'Self-conscious discomfort in front of others.']]],
      ['Disappointed', 'Let down when things fall short of what you hoped.', [
        ['Appalled', 'Shocked by something deeply wrong.'],
        ['Revolted', 'A strong inner rejection of something.']]],
      ['Awful', 'Feeling very bad, inside or about something.', [
        ['Nauseated', 'Sickened, almost physically.'],
        ['Detestable', 'Finding something hateful and repugnant.']]],
      ['Repelled', 'Pushed back by something you can’t accept.', [
        ['Horrified', 'Filled with shock and dread.'],
        ['Hesitant', 'Holding back, unsure whether to move closer.']]]
    ]
  },
  {
    name: 'Sad', color: '#D8707F',
    desc: 'A heavy, low feeling that comes with loss, disappointment, or hurt.',
    children: [
      ['Hurt', 'Emotional pain from something said or done.', [
        ['Embarrassed', 'Uncomfortable, wishing you could disappear for a moment.'],
        ['Disappointed', 'Sad that hopes or expectations weren’t met.']]],
      ['Depressed', 'A lasting heaviness that dims energy and interest.', [
        ['Inferior', 'Feeling not as good as others.'],
        ['Empty', 'A hollow feeling, as if something is missing.']]],
      ['Guilty', 'Feeling you did something wrong.', [
        ['Remorseful', 'Deep regret, wishing you could undo it.'],
        ['Ashamed', 'Feeling bad about who you are, not only what you did.']]],
      ['Despair', 'Loss of hope that things will get better.', [
        ['Powerless', 'Unable to change your situation.'],
        ['Grief', 'Deep sorrow after a loss.']]],
      ['Vulnerable', 'Open to being hurt.', [
        ['Fragile', 'Easily broken right now.'],
        ['Victimised', 'Singled out for harm.']]],
      ['Lonely', 'Longing for connection that isn’t there.', [
        ['Abandoned', 'Left behind by someone you needed.'],
        ['Isolated', 'Cut off from others.']]]
    ]
  },
  {
    name: 'Happy', color: '#F0866B',
    desc: 'A sense of contentment, joy, and well-being.',
    children: [
      ['Optimistic', 'Expecting good things ahead.', [
        ['Inspired', 'Filled with the urge to create or act.'],
        ['Hopeful', 'Believing things can turn out well.']]],
      ['Trusting', 'Safe to rely on others.', [
        ['Intimate', 'A close, warm connection with someone.'],
        ['Sensitive', 'Open and deeply attuned to feelings.']]],
      ['Peaceful', 'Calm, at ease, and settled.', [
        ['Thankful', 'Grateful for what you have.'],
        ['Loving', 'Warm affection and care for others.']]],
      ['Powerful', 'Strong and capable.', [
        ['Creative', 'Full of ideas and the energy to make them real.'],
        ['Courageous', 'Ready to face fear and act anyway.']]],
      ['Accepted', 'Welcomed as you are.', [
        ['Valued', 'Knowing you matter to others.'],
        ['Respected', 'Feeling your worth is recognised.']]],
      ['Proud', 'Pleased with who you are or what you did.', [
        ['Confident', 'Trusting your own abilities.'],
        ['Successful', 'Having reached something you worked for.']]],
      ['Interested', 'Drawn in and wanting to know more.', [
        ['Inquisitive', 'Eager to ask and explore.'],
        ['Curious', 'Open, playful wondering.']]],
      ['Content', 'Satisfied with how things are.', [
        ['Joyful', 'Bright, overflowing happiness.'],
        ['Free', 'Unburdened and light.']]],
      ['Playful', 'Light-hearted and ready for fun.', [
        ['Cheeky', 'Playfully bold or mischievous.'],
        ['Aroused', 'Energised, alive, and stirred up.']]]
    ]
  },
  {
    name: 'Surprised', color: '#EFA54A',
    desc: 'A quick reaction to something unexpected.',
    children: [
      ['Excited', 'Buzzing anticipation for what’s ahead.', [
        ['Energetic', 'Full of lively energy.'],
        ['Eager', 'Keen and impatient to begin.']]],
      ['Amazed', 'Struck by something remarkable.', [
        ['Awe', 'Wonder at something vast or beautiful.'],
        ['Astonished', 'Greatly surprised, almost in disbelief.']]],
      ['Confused', 'Unable to make sense of what’s happening.', [
        ['Perplexed', 'Puzzled and unsure what it means.'],
        ['Disillusioned', 'Disappointed after seeing things as they really are.']]],
      ['Startled', 'A sudden jolt from the unexpected.', [
        ['Dismayed', 'Suddenly upset and discouraged.'],
        ['Shocked', 'Stunned by something sudden and disturbing.']]]
    ]
  },
  {
    name: 'Bad', color: '#37BC98',
    desc: 'A general sense that something is off, drained, or not quite right.',
    children: [
      ['Tired', 'Low on energy, in body or mind.', [
        ['Unfocused', 'Attention drifting, hard to concentrate.'],
        ['Sleepy', 'Wanting rest and sleep.']]],
      ['Stressed', 'Under pressure from too many demands.', [
        ['Out of control', 'Things are moving without you steering.'],
        ['Overwhelmed', 'Buried under more than you can manage.']]],
      ['Busy', 'Occupied with a lot to do.', [
        ['Rushed', 'Hurried, with no time to breathe.'],
        ['Pressured', 'Pushed by expectations or deadlines.']]],
      ['Bored', 'Unstimulated and restless.', [
        ['Apathetic', 'Not caring much about anything.'],
        ['Indifferent', 'Neither for nor against — just flat.']]]
    ]
  }
];

window.CONTENT = {
  happy: {
    insight: {
      quote: 'Happiness is equal to or greater than the difference between your perception of life events and your expectations of how life should behave.',
      author: 'Mo Gawdat'
    },
    formula: 'Happiness ≥ Reality − Expectations',
    regulate: 'Physical reset — use a simple movement to return to your center.',
    audio: { music: true },     // or { src: 'audio/happy.mp3' } once you add a royalty-free track
    video: null,                // e.g. 'videos/happy.mp4'
    f: { video: null },         // e.g. 'videos/happy-f.mp4'
    m: { video: null }          // e.g. 'videos/happy-m.mp4'
  }
};
