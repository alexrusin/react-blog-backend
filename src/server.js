import express from 'express';
import bodyParser from 'body-parser';
import Datastore from 'nedb-promises';
import path from 'path';
let articles = Datastore.create('./articles')


const app = express();
app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {
    try {
        const articleName = req.params.name;
        const articleInfo = await articles.findOne({
            name: articleName
        });

        if (!articleInfo) {
            return res.status(404).send('Not found');
        }

        res.send(articleInfo);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error fetching article', error
        })
    }
    
})

app.get('/api/articles/:name/upvote', (req, res) => {
    const articleName = req.params.name;

    articles.insert({
        name: articleName,
        upvotes: 0,
        comments: []
    }).then(article => res.status(200).send(article));

});

app.post('/api/articles/:name/upvote', async (req, res) => {
    const articleName = req.params.name;

    const articleInfo = await articles.findOne({
        name: articleName
    });

    articles.update({
        _id: articleInfo._id
    }, {
        $set: { upvotes: articleInfo.upvotes + 1 }
    }, {
        returnUpdatedDocs: true
    }).then(article => res.status(200).send(article));

});

app.post('/api/articles/:name/add-comment', async (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;

    const articleInfo = await articles.findOne({
        name: articleName
    });

    const article = await articles.update({
        _id: articleInfo._id
    }, {
        $set: { comments: articleInfo.comments.concat({
            username,
            text
        }) }
    }, {
        returnUpdatedDocs: true
    });

    res.status(200).send(article);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});


app.listen(8001, () => console.log('Listening on port 8001'));