export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const espnRes = await fetch(
            'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard',
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        const espnData = await espnRes.json();
        const events = espnData?.events || [];
        const comp = events[0]?.competitions?.[0];
        const sample = comp?.competitors?.[0];

        // Return raw sample so we can see the structure
        res.status(200).json({ 
            eventName: events[0]?.name,
            samplePlayerName: sample?.athlete?.displayName,
            sampleScore: sample?.score,
            sampleStatus: sample?.status,
            sampleLinescores: sample?.linescores,
            sampleStatistics: sample?.statistics,
            sampleKeys: sample ? Object.keys(sample) : []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
