const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'study.json');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 确保数据文件存在
function ensureDataFile() {
    const initialData = {
        chapters: [],
        notes: [],
        questions: [],
        plans: []
    };

    // 检查是否存在初始化数据文件
    const initialFile = path.join(__dirname, 'data', 'initial.json');
    if (fs.existsSync(initialFile) && !fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(initialFile, 'utf-8'));
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } else if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
}

// 读取数据
function readData() {
    ensureDataFile();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

// 写入数据
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// API 路由

// 获取所有数据
app.get('/api/data', (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: '读取数据失败' });
    }
});

// 更新章节状态
app.post('/api/chapters/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const data = readData();

        const chapter = data.chapters.find(c => c.id === id);
        if (chapter) {
            chapter.status = status;
            chapter.studyDate = status === 'completed' ? new Date().toISOString().split('T')[0] : null;
            writeData(data);
            res.json(chapter);
        } else {
            res.status(404).json({ error: '章节不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '更新失败' });
    }
});

// 笔记 CRUD
app.get('/api/notes', (req, res) => {
    try {
        const data = readData();
        res.json(data.notes);
    } catch (error) {
        res.status(500).json({ error: '读取笔记失败' });
    }
});

app.post('/api/notes', (req, res) => {
    try {
        const { title, content, chapter, tags } = req.body;
        const data = readData();

        const newNote = {
            id: Date.now(),
            title,
            content,
            chapter,
            tags: tags || [],
            createdAt: new Date().toISOString().split('T')[0]
        };

        data.notes.push(newNote);
        writeData(data);
        res.json(newNote);
    } catch (error) {
        res.status(500).json({ error: '添加笔记失败' });
    }
});

app.put('/api/notes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, chapter, tags } = req.body;
        const data = readData();

        const noteIndex = data.notes.findIndex(n => n.id === parseInt(id));
        if (noteIndex !== -1) {
            data.notes[noteIndex] = {
                ...data.notes[noteIndex],
                title,
                content,
                chapter,
                tags: tags || []
            };
            writeData(data);
            res.json(data.notes[noteIndex]);
        } else {
            res.status(404).json({ error: '笔记不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '更新笔记失败' });
    }
});

app.delete('/api/notes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = readData();

        const noteIndex = data.notes.findIndex(n => n.id === parseInt(id));
        if (noteIndex !== -1) {
            data.notes.splice(noteIndex, 1);
            writeData(data);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: '笔记不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '删除笔记失败' });
    }
});

// 错题 CRUD
app.get('/api/questions', (req, res) => {
    try {
        const data = readData();
        res.json(data.questions);
    } catch (error) {
        res.status(500).json({ error: '读取错题失败' });
    }
});

app.post('/api/questions', (req, res) => {
    try {
        const { type, question, answer, wrongAnswer, explanation, chapter } = req.body;
        const data = readData();

        const newQuestion = {
            id: Date.now(),
            type,
            question,
            answer,
            wrongAnswer,
            explanation,
            chapter,
            mastered: false,
            createdAt: new Date().toISOString().split('T')[0]
        };

        data.questions.push(newQuestion);
        writeData(data);
        res.json(newQuestion);
    } catch (error) {
        res.status(500).json({ error: '添加错题失败' });
    }
});

app.put('/api/questions/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { type, question, answer, wrongAnswer, explanation, chapter, mastered } = req.body;
        const data = readData();

        const qIndex = data.questions.findIndex(q => q.id === parseInt(id));
        if (qIndex !== -1) {
            data.questions[qIndex] = {
                ...data.questions[qIndex],
                type,
                question,
                answer,
                wrongAnswer,
                explanation,
                chapter,
                mastered: mastered !== undefined ? mastered : data.questions[qIndex].mastered
            };
            writeData(data);
            res.json(data.questions[qIndex]);
        } else {
            res.status(404).json({ error: '错题不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '更新错题失败' });
    }
});

app.delete('/api/questions/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = readData();

        const qIndex = data.questions.findIndex(q => q.id === parseInt(id));
        if (qIndex !== -1) {
            data.questions.splice(qIndex, 1);
            writeData(data);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: '错题不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '删除错题失败' });
    }
});

// 复习计划 CRUD
app.get('/api/plans', (req, res) => {
    try {
        const data = readData();
        res.json(data.plans);
    } catch (error) {
        res.status(500).json({ error: '读取计划失败' });
    }
});

app.post('/api/plans', (req, res) => {
    try {
        const { title, description, date } = req.body;
        const data = readData();

        const newPlan = {
            id: Date.now(),
            title,
            description,
            date,
            completed: false
        };

        data.plans.push(newPlan);
        writeData(data);
        res.json(newPlan);
    } catch (error) {
        res.status(500).json({ error: '添加计划失败' });
    }
});

app.put('/api/plans/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, completed } = req.body;
        const data = readData();

        const planIndex = data.plans.findIndex(p => p.id === parseInt(id));
        if (planIndex !== -1) {
            data.plans[planIndex] = {
                ...data.plans[planIndex],
                title,
                description,
                date,
                completed: completed !== undefined ? completed : data.plans[planIndex].completed
            };
            writeData(data);
            res.json(data.plans[planIndex]);
        } else {
            res.status(404).json({ error: '计划不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '更新计划失败' });
    }
});

app.delete('/api/plans/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = readData();

        const planIndex = data.plans.findIndex(p => p.id === parseInt(id));
        if (planIndex !== -1) {
            data.plans.splice(planIndex, 1);
            writeData(data);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: '计划不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: '删除计划失败' });
    }
});

// 导出数据
app.get('/api/export', (req, res) => {
    try {
        const data = readData();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=study-data.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: '导出失败' });
    }
});

// 导入数据
app.post('/api/import', (req, res) => {
    try {
        const { data } = req.body;
        writeData(data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '导入失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    ensureDataFile();
    console.log(`========================================`);
    console.log(`  教资高中数学学习记录网站`);
    console.log(`  地址: http://localhost:${PORT}`);
    console.log(`========================================`);
});