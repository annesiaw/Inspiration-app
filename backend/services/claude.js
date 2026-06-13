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
    content: "From the 1920s through the mid-1930s, Harlem, New York became the epicenter of a profound African American cultural, social, and artistic explosion. Luminaries like Langston Hughes, Zora Neale Hurston, Duke Ellington, and Louis Armstrong redefined American art, literature, and music. This movement didn't just celebrate Black culture — it challenged racist narratives and laid the intellectual groundwork for the Civil Rights Movement.",
    category: "Culture",
    significance: "The Harlem Renaissance proved that Black creativity and intellect were forces that would reshape American culture permanently."
  }
};

async function generateDailyContent() {
  const today = new Date().toISOString().split('T')[0];

  if (cachedContent && cacheDate === today) {
    return cachedContent;
  }

  const dateObj = new Date();
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const prompt = `Today is ${formattedDate}.

You are a cultural historian and educator specializing in Black history and the African diaspora. Generate today's daily inspirational content for a mobile app celebrating Black culture, history, and achievements.

Return ONLY a valid JSON object with this exact structure, no markdown, no extra text:
{
  "inspiration": {
    "quote": "the actual quote",
    "author": "Full Name",
    "authorTitle": "brief title/role (e.g. 'Civil rights leader and theologian')",
    "authorYears": "birth–death years or 'b. YYYY' if living",
    "reflection": "A 1-2 sentence reflection connecting this wisdom to how people can live today"
  },
  "fact": {
    "title": "An engaging title for the fact or lesson",
    "content": "2-3 sentences explaining the fact/lesson with rich detail",
    "category": "One of: History, Music, Art, Science, Literature, Sports, Culture, Fashion, Food, Politics",
    "significance": "1 sentence on why this moment or person matters"
  }
}

Guidelines:
- Draw from the full breadth of the Black diaspora: African kingdoms, Caribbean culture, American civil rights, Harlem Renaissance, contemporary achievements
- Consider if today's date (${formattedDate}) has historical significance (birthdays, anniversaries of major events in Black history)
- Figures to draw from (not exhaustive): Harriet Tubman, Frederick Douglass, Ida B. Wells, Sojourner Truth, Marcus Garvey, Langston Hughes, Zora Neale Hurston, W.E.B. Du Bois, Booker T. Washington, Miles Davis, Ella Fitzgerald, Billie Holiday, Nina Simone, John Coltrane, Aretha Franklin, Toni Morrison, James Baldwin, Maya Angelou, Audre Lorde, Octavia Butler, Katherine Johnson, Mae Jemison, Charles Drew, Mansa Musa, Queen Nzinga, Shaka Zulu, Nelson Mandela, Desmond Tutu, Wangari Maathai, Chimamanda Ngozi Adichie, Barack Obama, Shirley Chisholm, Fannie Lou Hamer, Thurgood Marshall, Medgar Evers, Rosa Parks, Coretta Scott King, Malcolm X, MLK, Fred Hampton
- Cover diverse categories across different requests
- Content must be historically accurate and uplifting
- Make the reflection actionable and personal`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text.trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    const content = JSON.parse(jsonString);

    cachedContent = content;
    cacheDate = today;
    return content;
  } catch (err) {
    console.error('Claude API error, using fallback content:', err.message);
    return FALLBACK_CONTENT;
  }
}

module.exports = { generateDailyContent };
