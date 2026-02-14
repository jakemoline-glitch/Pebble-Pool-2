export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Fetch live leaderboard from ESPN's public golf API
        const espnRes = await fetch(
            'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard',
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        const espnData = await espnRes.json();

        // Extract player scores from ESPN response
        const scores = {};
        const events = espnData?.events || [];

        for (const event of events) {
            const competitions = event?.competitions || [];
            for (const comp of competitions) {
                const competitors = comp?.competitors || [];
                for (const player of competitors) {
                    const name = player?.athlete?.displayName;
                    const scoreStr = player?.score?.displayValue;
                    if (!name) continue;

                    let score = 0;
                    if (scoreStr === 'E' || scoreStr === 'EVEN' || !scoreStr) {
                        score = 0;
                    } else {
                        const parsed = parseInt(scoreStr.replace('+', ''));
                        score = isNaN(parsed) ? 0 : parsed;
                    }
                    scores[name] = score;
                }
            }
        }

        res.status(200).json({ scores, event: events[0]?.name || 'PGA Tour' });
    } catch (err) {
        console.error('ESPN fetch error:', err);
        res.status(500).json({ error: err.message });
    }
}
