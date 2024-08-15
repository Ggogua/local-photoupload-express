const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Upload Photo</title>
        </head>
        <body>
            <h1>Upload a Photo</h1>
            <form action="/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="photo" accept="image/*" required />
                <button type="submit">Upload</button>
            </form>
            <h1>Uploaded Photos</h1>
            <ul id="uploaded-photos"></ul>
            <script>
                fetch('/list')
                    .then(response => response.json())
                    .then(files => {
                        const ul = document.getElementById('uploaded-photos');
                        files.forEach(file => {
                            const li = document.createElement('li');
                            const link = document.createElement('a');
                            link.href = '/uploads/' + file;
                            link.innerText = file;
                            link.download = file;
                            li.appendChild(link);
                            ul.appendChild(li);
                        });
                    });
            </script>
        </body>
        </html>
    `);
});

app.post('/upload', upload.single('photo'), (req, res) => {
    if (req.file) {
        res.send(`
            <h1>File uploaded successfully!</h1>
            <p><a href="/">Upload another photo</a></p>
            <p><a href="/uploads/${req.file.filename}" download>Download uploaded photo</a></p>
        `);
    } else {
        res.send('<h1>No file uploaded.</h1><p><a href="/">Try again</a></p>');
    }
});

app.use('/uploads', express.static(uploadDir));
app.get('/list', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to list files' });
        }
        res.json(files);
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
});
