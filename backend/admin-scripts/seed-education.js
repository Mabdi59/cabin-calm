const db = require('../database');

const educationArticles = [
  {
    title: "Understanding Turbulence",
    category: "turbulence",
    summary: "Learn why turbulence happens and why it's completely safe.",
    content: "Turbulence is caused by irregular air movements in the atmosphere. While it can feel scary, modern aircraft are designed to withstand much more stress than turbulence creates. Think of it like driving over a bumpy road - uncomfortable but not dangerous."
  },
  {
    title: "Engine Sounds",
    category: "sounds",
    summary: "Why engine sounds change during different flight phases.",
    content: "Engine sounds change during different phases of flight. During takeoff, engines are at maximum power and louder. During cruise, they become quieter. Changes in engine noise are normal and part of the pilot's flight plan."
  },
  {
    title: "Takeoff and Climb",
    category: "phases",
    summary: "What to expect during takeoff and initial climb.",
    content: "During takeoff, you'll feel acceleration and hear loud engine noise. The nose of the aircraft tilts up, and you may feel pressure changes. This is all normal. Pilots reduce engine power slightly after initial climb for noise reduction and fuel efficiency."
  },
  {
    title: "Descent and Landing",
    category: "phases",
    summary: "Normal sensations and sounds during landing approach.",
    content: "During descent, you may hear the engines quiet down and feel your ears pop. You'll also hear thumps as landing gear deploys and feel the aircraft slow as flaps extend. These are all normal landing preparations."
  },
  {
    title: "Wing Movements",
    category: "sensations",
    summary: "Why airplane wings flex and why that's a good thing.",
    content: "Aircraft wings are designed to flex - they can move up and down several feet! This flexibility helps absorb turbulence and makes the aircraft safer. Seeing wings flex is completely normal and expected."
  },
  {
    title: "Air Pockets",
    category: "turbulence",
    summary: "The truth about \"air pockets\" and sudden drops.",
    content: "There's no such thing as an \"air pocket.\" What people call air pockets are simply areas of rising or sinking air (updrafts and downdrafts). The aircraft doesn't \"drop\" - it rides through these air currents like a boat on waves."
  }
];

console.log('🌱 Seeding education content...\n');

// Clear existing content first
db.run('DELETE FROM education_content', (err) => {
  if (err) {
    console.error('Error clearing existing content:', err);
    return;
  }
  
  console.log('✅ Cleared existing content');
  
  // Insert new content
  const stmt = db.prepare(`
    INSERT INTO education_content (title, category, summary, content)
    VALUES (?, ?, ?, ?)
  `);
  
  let inserted = 0;
  
  educationArticles.forEach((article) => {
    stmt.run(
      article.title,
      article.category,
      article.summary,
      article.content,
      (err) => {
        if (err) {
          console.error(`❌ Failed to insert "${article.title}":`, err.message);
        } else {
          inserted++;
          console.log(`✅ Inserted: ${article.title}`);
          
          if (inserted === educationArticles.length) {
            stmt.finalize();
            console.log(`\n🎉 Successfully seeded ${inserted} education articles!`);
            db.close();
          }
        }
      }
    );
  });
});
