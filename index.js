const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const parser = new Parser({
    customFields: {
        item: ['enclosure']
    }
});

const RSS_SOURCES = {
    news: 'https://www.antaranews.com/rss/terkini.xml',
    tech: 'https://www.antaranews.com/rss/tekno.xml',
    sport: 'https://www.antaranews.com/rss/olahraga.xml',
    economy: 'https://www.antaranews.com/rss/ekonomi.xml',
    lifestyle: 'https://www.antaranews.com/rss/lifestyle.xml',
    world: 'https://www.antaranews.com/rss/dunia.xml',
    politics: 'https://www.antaranews.com/rss/politik.xml',
    entertainment: 'https://www.antaranews.com/rss/hiburan.xml',
    culture: 'https://www.antaranews.com/rss/humaniora.xml'
};

app.get('/', (req, res) => {
    res.json({
        message: 'PlaticpusN News API is running!',
        status: 'OK',
        endpoints: [
            '/api/news/category/:category'
        ]
    });
});

app.get('/api/news/category/:category', async (req, res) => {
    const categoryName = req.params.category.toLowerCase();
    
    const rssUrl = RSS_SOURCES[categoryName];

    if (!rssUrl) {
        return res.status(404).json({
            status: 'error',
            message: `Kategori '${categoryName}' tidak ditemukan.`
        });
    }

    try {
        const feed = await parser.parseURL(rssUrl);
        const formattedNews = feed.items.map(item => {
            let imageUrl = null;
            if (item.enclosure && item.enclosure.url) {
                imageUrl = item.enclosure.url;
            }

            return {
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                description: item.contentSnippet || item.content,
                image: imageUrl,
                source: "ANTARA News",
                category: categoryName
            };
        });

        res.json({
            status: 'success',
            category: categoryName,
            totalResults: formattedNews.length,
            articles: formattedNews
        });

    } catch (error) {
        console.error('Error fetching RSS:', error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil berita dari sumber.',
            errorDetail: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`[🚀] Server PlaticpusN API berjalan di http://localhost:${PORT}`);
});