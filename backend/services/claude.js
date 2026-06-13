const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let cachedContent = null;
let cacheDate = null;

const FALLBACK_CONTENT = {
  inspiration: {
    quote: "If you are always trying to be normal, you will never know how amazing you can be.",
    author: "Maya Angelou",
    authorTitle: "Poet, memoirist, and civil rights activist",
    authorYears: "1928–2014",
    reflection: "Embrace what makes you uniquely yourself. Normalcy is a myth — your full expression is your greatest gift to the world."
  },
  fact: {
    title: "The Harlem Renaissance: A Cultural Revolution",
    content: "From the 1920s through the mid-1930s, Harlem became the epicenter of a profound African American cultural, social, and artistic explosion. Luminaries like Langston Hughes, Zora Neale Hurston, Duke Ellington, and Louis Armstrong redefined American art, literature, and music. This movement challenged racist narratives and laid the intellectual groundwork for the Civil Rights Movement.",
    category: "Culture",
    significance: "The Harlem Renaissance proved that Black creativity and intellect were forces that would reshape American culture permanently."
  },
  figure: {
    name: "Katherine Johnson",
    lifespan: "1918–2020",
    title: "NASA mathematician and aerospace technologist",
    field: "Science",
    achievement: "Katherine Johnson's precise orbital mechanics calculations were crucial to NASA's early space missions. John Glenn refused to fly unless Johnson personally verified the computer's calculations before his 1962 orbital flight.",
    funFact: "She calculated trajectories by hand so accurately that her work remained indispensable even after NASA introduced electronic computers."
  }
};

async function generateDailyContent() {
  const today = new Date().toISOString().split('T')[0];

  if (cachedContent && cacheDate === today) {
    return cachedContent;
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const prompt = `Today is ${formattedDate}.

You are a cultural historian and educator specializing in Black history and the African diaspora. Generate today's daily content for a mobile app celebrating Black culture, history, and achievements.

Return ONLY a valid JSON object with this exact structure, no markdown, no extra text:
{
  "inspiration": {
    "quote": "the actual quote",
    "author": "Full Name",
    "authorTitle": "brief title/role",
    "authorYears": "birth–death or 'b. YYYY' if living",
    "reflection": "1-2 sentence reflection connecting this wisdom to daily life today"
  },
  "fact": {
    "title": "An engaging title for the fact or lesson",
    "content": "2-3 sentences with rich detail",
    "category": "One of: History, Music, Art, Science, Literature, Sports, Culture, Fashion, Food, Politics",
    "significance": "1 sentence on why this matters"
  },
  "figure": {
    "name": "Full Name",
    "lifespan": "YYYY–YYYY or 'b. YYYY' if living",
    "title": "Primary role or occupation",
    "field": "One of: Civil Rights, Music, Art, Science, Literature, Sports, Politics, Business, Education, Fashion, Architecture, Philosophy",
    "achievement": "Their most significant contribution in 1-2 sentences",
    "funFact": "A surprising or lesser-known fact in 1 sentence"
  }
}

Guidelines:
- The figure must be a DIFFERENT person from the inspiration quote's author
- Draw from the full breadth of the Black diaspora: African history, Caribbean culture, American civil rights, Harlem Renaissance, contemporary achievement
- Consider if today's date (${formattedDate}) has historical significance
- Cover diverse categories and eras across all three sections
- Be historically accurate and uplifting`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text.trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const content = JSON.parse(text.slice(jsonStart, jsonEnd));

    cachedContent = content;
    cacheDate = today;
    return content;
  } catch (err) {
    console.error('Claude API error, using fallback:', err.message);
    return FALLBACK_CONTENT;
  }
}

module.exports = { generateDailyContent };
