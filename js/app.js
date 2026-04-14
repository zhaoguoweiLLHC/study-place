// ===== 全局变量 =====
let appData = {
    chapters: [],
    notes: [],
    questions: [],
    plans: []
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initNavigation();
    initEventListeners();
    renderOverview();
});

// ===== 数据加载 =====
async function loadData() {
    try {
        const response = await fetch('/api/data');
        appData = await response.json();
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// ===== 导航初始化 =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // 更新导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // 更新页面
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });

    // 渲染对应页面
    switch (page) {
        case 'overview':
            renderOverview();
            break;
        case 'chapters':
            renderChapters();
            break;
        case 'notes':
            renderNotes();
            break;
        case 'questions':
            renderQuestions();
            break;
        case 'plans':
            renderPlans();
            break;
    }
}

// ===== 事件监听 =====
function initEventListeners() {
    // 添加笔记
    document.getElementById('addNoteBtn').addEventListener('click', () => openNoteModal());

    // 添加错题
    document.getElementById('addQuestionBtn').addEventListener('click', () => openQuestionModal());

    // 添加计划
    document.getElementById('addPlanBtn').addEventListener('click', () => openPlanModal());

    // 搜索笔记
    document.getElementById('noteSearch').addEventListener('input', renderNotes);

    // 筛选笔记章节
    document.getElementById('noteChapterFilter').addEventListener('change', renderNotes);

    // 筛选错题章节
    document.getElementById('questionChapterFilter').addEventListener('change', renderQuestions);

    // 筛选错题状态
    document.getElementById('questionStatusFilter').addEventListener('change', renderQuestions);

    // 模态框关闭
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalContainer').addEventListener('click', (e) => {
        if (e.target.id === 'modalContainer') closeModal();
    });

    // 导出数据
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // 导入数据
    document.getElementById('importInput').addEventListener('change', importData);
}

// ===== 概览页面 =====
function renderOverview() {
    // 统计
    const completedChapters = appData.chapters.filter(c => c.status === 'completed').length;
    const studyingChapters = appData.chapters.filter(c => c.status === 'studying').length;

    document.getElementById('stat-chapters').textContent = completedChapters + studyingChapters;
    document.getElementById('stat-completed').textContent = completedChapters;
    document.getElementById('stat-notes').textContent = appData.notes.length;
    document.getElementById('stat-questions').textContent = appData.questions.filter(q => !q.mastered).length;

    // 今日计划
    const today = new Date().toISOString().split('T')[0];
    const todayPlans = appData.plans.filter(p => p.date === today && !p.completed);
    const todayPlansEl = document.getElementById('todayPlans');

    if (todayPlans.length > 0) {
        todayPlansEl.innerHTML = todayPlans.map(plan => `
            <div class="plan-card">
                <div class="plan-info">
                    <div class="plan-title">${plan.title}</div>
                    <div class="plan-date">${plan.description || '无描述'}</div>
                </div>
                <button class="btn-icon success" onclick="completePlan(${plan.id})">✓</button>
            </div>
        `).join('');
    } else {
        todayPlansEl.innerHTML = '<p class="empty-text">暂无今日计划</p>';
    }

    // 待巩固错题
    const pendingQuestions = appData.questions.filter(q => !q.mastered).slice(0, 5);
    const pendingQuestionsEl = document.getElementById('pendingQuestions');

    if (pendingQuestions.length > 0) {
        pendingQuestionsEl.innerHTML = pendingQuestions.map(q => `
            <div class="question-card" style="padding: 12px; margin-bottom: 8px;">
                <div class="question-title" style="font-size: 14px;">${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}</div>
                <div class="question-meta">${getChapterName(q.chapter)}</div>
            </div>
        `).join('');
    } else {
        pendingQuestionsEl.innerHTML = '<p class="empty-text">暂无错题</p>';
    }
}

// ===== 章节学习页面 =====
function renderChapters() {
    const container = document.getElementById('chaptersContainer');

    // 按单元分组
    const units = {};
    appData.chapters.forEach(chapter => {
        const unitId = chapter.id.split('-')[0];
        const unitNames = {
            '1': '第一章 集合与常用逻辑用语',
            '2': '第二章 一元二次函数、方程和不等式',
            '3': '第三章 函数的概念与性质',
            '4': '第四章 指数函数与对数函数',
            '5': '第五章 三角函数',
            '6': '第六章 平面向量',
            '7': '第七章 复数',
            '8': '第八章 立体几何',
            '9': '第九章 平面解析几何',
            '10': '第十章 计数原理',
            '11': '第十一章 概率'
        };
        const unitName = unitNames[unitId] || `第${unitId}章`;
        if (!units[unitId]) {
            units[unitId] = { name: unitName, chapters: [] };
        }
        units[unitId].chapters.push(chapter);
    });

    container.innerHTML = Object.entries(units).map(([unitId, unit]) => `
        <div class="chapter-unit">
            <div class="unit-header" onclick="toggleUnit(this)">
                <span>${unit.name}</span>
                <span class="toggle-icon">▼</span>
            </div>
            <div class="chapters-list">
                ${unit.chapters.map(chapter => `
                    <div class="chapter-item" onclick="openChapterModal('${chapter.id}')">
                        <span class="chapter-name">${chapter.name}</span>
                        <span class="chapter-status status-${chapter.status}">${getStatusText(chapter.status)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // 初始化章节筛选
    initChapterFilters();
}

function toggleUnit(header) {
    header.classList.toggle('collapsed');
    header.nextElementSibling.classList.toggle('collapsed');
}

function getStatusText(status) {
    const texts = { pending: '未学', studying: '学习中', completed: '已完成' };
    return texts[status] || '未学';
}

function getChapterName(chapterId) {
    const chapter = appData.chapters.find(c => c.id === chapterId);
    return chapter ? chapter.name : '未知章节';
}

// ===== 笔记页面 =====
function renderNotes() {
    const searchText = document.getElementById('noteSearch').value.toLowerCase();
    const chapterFilter = document.getElementById('noteChapterFilter').value;

    let filteredNotes = appData.notes;

    if (searchText) {
        filteredNotes = filteredNotes.filter(n =>
            n.title.toLowerCase().includes(searchText) ||
            n.content.toLowerCase().includes(searchText)
        );
    }

    if (chapterFilter) {
        filteredNotes = filteredNotes.filter(n => n.chapter === chapterFilter);
    }

    const container = document.getElementById('notesList');

    if (filteredNotes.length === 0) {
        container.innerHTML = '<p class="empty-text">暂无笔记</p>';
        return;
    }

    container.innerHTML = filteredNotes.map(note => `
        <div class="note-card">
            <div class="note-header">
                <span class="note-title">${note.title}</span>
                <div class="note-tags">
                    ${(note.tags || []).map(tag => `
                        <span class="tag ${tag === '重点' || tag === '易错' ? 'important' : ''}">${tag}</span>
                    `).join('')}
                </div>
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-footer">
                <span class="note-meta">${getChapterName(note.chapter)} · ${note.createdAt}</span>
                <div class="note-actions">
                    <button class="btn-icon" onclick="openNoteModal(${note.id})">✏️</button>
                    <button class="btn-icon" onclick="deleteNote(${note.id})">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openNoteModal(noteId = null) {
    const note = noteId ? appData.notes.find(n => n.id === noteId) : null;

    document.getElementById('modalTitle').textContent = noteId ? '编辑笔记' : '添加笔记';

    document.getElementById('modalBody').innerHTML = `
        <form id="noteForm">
            <div class="form-group">
                <label class="form-label">标题</label>
                <input type="text" class="form-input" id="noteTitle" value="${note?.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">所属章节</label>
                <select class="form-select" id="noteChapter" required>
                    <option value="">选择章节</option>
                    ${appData.chapters.map(c => `
                        <option value="${c.id}" ${note?.chapter === c.id ? 'selected' : ''}>${c.name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">内容</label>
                <textarea class="form-textarea" id="noteContent" required>${note?.content || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">标签（用逗号分隔）</label>
                <input type="text" class="form-input" id="noteTags" value="${(note?.tags || []).join(', ')}" placeholder="重点, 易错">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn-primary">保存</button>
            </div>
        </form>
    `;

    document.getElementById('noteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveNote(noteId);
    });

    openModal();
}

async function saveNote(noteId) {
    const title = document.getElementById('noteTitle').value;
    const chapter = document.getElementById('noteChapter').value;
    const content = document.getElementById('noteContent').value;
    const tags = document.getElementById('noteTags').value.split(',').map(t => t.trim()).filter(t => t);

    try {
        if (noteId) {
            await fetch(`/api/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, chapter, content, tags })
            });
        } else {
            await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, chapter, content, tags })
            });
        }

        await loadData();
        renderNotes();
        closeModal();
    } catch (error) {
        alert('保存失败');
    }
}

async function deleteNote(noteId) {
    if (!confirm('确定要删除这条笔记吗？')) return;

    try {
        await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
        await loadData();
        renderNotes();
    } catch (error) {
        alert('删除失败');
    }
}

// ===== 错题本页面 =====
function renderQuestions() {
    const chapterFilter = document.getElementById('questionChapterFilter').value;
    const statusFilter = document.getElementById('questionStatusFilter').value;

    let filteredQuestions = appData.questions;

    if (chapterFilter) {
        filteredQuestions = filteredQuestions.filter(q => q.chapter === chapterFilter);
    }

    if (statusFilter) {
        const mastered = statusFilter === 'mastered';
        filteredQuestions = filteredQuestions.filter(q => q.mastered === mastered);
    }

    const container = document.getElementById('questionsList');

    if (filteredQuestions.length === 0) {
        container.innerHTML = '<p class="empty-text">暂无错题</p>';
        return;
    }

    container.innerHTML = filteredQuestions.map(q => `
        <div class="question-card">
            <div class="question-header">
                <span class="question-title">${q.type} - ${q.question.substring(0, 30)}${q.question.length > 30 ? '...' : ''}</span>
                <span class="tag ${q.mastered ? '' : 'important'}">${q.mastered ? '已掌握' : '未掌握'}</span>
            </div>
            <div class="note-content">
                <p><strong>正确答案：</strong>${q.answer}</p>
                <p><strong>我的答案：</strong>${q.wrongAnswer}</p>
                <p><strong>解析：</strong>${q.explanation}</p>
            </div>
            <div class="question-footer">
                <span class="question-meta">${getChapterName(q.chapter)} · ${q.createdAt}</span>
                <div class="question-actions">
                    ${!q.mastered ? `<button class="btn-icon success" onclick="markQuestionMastered(${q.id})" title="标记已掌握">✓</button>` : ''}
                    <button class="btn-icon" onclick="openQuestionModal(${q.id})">✏️</button>
                    <button class="btn-icon" onclick="deleteQuestion(${q.id})">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openQuestionModal(questionId = null) {
    const question = questionId ? appData.questions.find(q => q.id === questionId) : null;

    document.getElementById('modalTitle').textContent = questionId ? '编辑错题' : '添加错题';

    document.getElementById('modalBody').innerHTML = `
        <form id="questionForm">
            <div class="form-group">
                <label class="form-label">题目类型</label>
                <select class="form-select" id="questionType" required>
                    <option value="选择题" ${question?.type === '选择题' ? 'selected' : ''}>选择题</option>
                    <option value="填空题" ${question?.type === '填空题' ? 'selected' : ''}>填空题</option>
                    <option value="解答题" ${question?.type === '解答题' ? 'selected' : ''}>解答题</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">所属章节</label>
                <select class="form-select" id="questionChapter" required>
                    <option value="">选择章节</option>
                    ${appData.chapters.map(c => `
                        <option value="${c.id}" ${question?.chapter === c.id ? 'selected' : ''}>${c.name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">题目内容</label>
                <textarea class="form-textarea" id="questionContent" required>${question?.question || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">正确答案</label>
                <input type="text" class="form-input" id="questionAnswer" value="${question?.answer || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">我的答案</label>
                <input type="text" class="form-input" id="questionWrongAnswer" value="${question?.wrongAnswer || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">解析</label>
                <textarea class="form-textarea" id="questionExplanation">${question?.explanation || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn-primary">保存</button>
            </div>
        </form>
    `;

    document.getElementById('questionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveQuestion(questionId);
    });

    openModal();
}

async function saveQuestion(questionId) {
    const type = document.getElementById('questionType').value;
    const chapter = document.getElementById('questionChapter').value;
    const question = document.getElementById('questionContent').value;
    const answer = document.getElementById('questionAnswer').value;
    const wrongAnswer = document.getElementById('questionWrongAnswer').value;
    const explanation = document.getElementById('questionExplanation').value;

    try {
        if (questionId) {
            await fetch(`/api/questions/${questionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, chapter, question, answer, wrongAnswer, explanation })
            });
        } else {
            await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, chapter, question, answer, wrongAnswer, explanation })
            });
        }

        await loadData();
        renderQuestions();
        closeModal();
    } catch (error) {
        alert('保存失败');
    }
}

async function markQuestionMastered(questionId) {
    try {
        const question = appData.questions.find(q => q.id === questionId);
        await fetch(`/api/questions/${questionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...question, mastered: true })
        });
        await loadData();
        renderQuestions();
    } catch (error) {
        alert('操作失败');
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('确定要删除这道错题吗？')) return;

    try {
        await fetch(`/api/questions/${questionId}`, { method: 'DELETE' });
        await loadData();
        renderQuestions();
    } catch (error) {
        alert('删除失败');
    }
}

// ===== 复习计划页面 =====
function renderPlans() {
    const pending = appData.plans.filter(p => !p.completed).sort((a, b) => a.date.localeCompare(b.date));
    const completed = appData.plans.filter(p => p.completed).sort((a, b) => b.date.localeCompare(a.date));

    const pendingContainer = document.getElementById('plansPending');
    const completedContainer = document.getElementById('plansCompleted');

    if (pending.length === 0) {
        pendingContainer.innerHTML = '<h3 class="plans-section-title">待完成</h3><p class="empty-text">暂无计划</p>';
    } else {
        pendingContainer.innerHTML = '<h3 class="plans-section-title">待完成</h3>' + pending.map(plan => `
            <div class="plan-card">
                <div class="plan-info">
                    <div class="plan-title">${plan.title}</div>
                    <div class="plan-date">${plan.date} · ${plan.description || '无描述'}</div>
                </div>
                <div class="question-actions">
                    <button class="btn-icon success" onclick="completePlan(${plan.id})" title="完成">✓</button>
                    <button class="btn-icon" onclick="openPlanModal(${plan.id})">✏️</button>
                    <button class="btn-icon" onclick="deletePlan(${plan.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    if (completed.length === 0) {
        completedContainer.innerHTML = '<h3 class="plans-section-title">已完成</h3><p class="empty-text">暂无已完成计划</p>';
    } else {
        completedContainer.innerHTML = '<h3 class="plans-section-title">已完成</h3>' + completed.map(plan => `
            <div class="plan-card completed">
                <div class="plan-info">
                    <div class="plan-title">${plan.title}</div>
                    <div class="plan-date">${plan.date} · ${plan.description || '无描述'}</div>
                </div>
                <button class="btn-icon" onclick="deletePlan(${plan.id})">🗑️</button>
            </div>
        `).join('');
    }
}

function openPlanModal(planId = null) {
    const plan = planId ? appData.plans.find(p => p.id === planId) : null;

    document.getElementById('modalTitle').textContent = planId ? '编辑计划' : '添加计划';

    document.getElementById('modalBody').innerHTML = `
        <form id="planForm">
            <div class="form-group">
                <label class="form-label">计划标题</label>
                <input type="text" class="form-input" id="planTitle" value="${plan?.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">计划日期</label>
                <input type="date" class="form-input" id="planDate" value="${plan?.date || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">描述</label>
                <textarea class="form-textarea" id="planDescription">${plan?.description || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn-primary">保存</button>
            </div>
        </form>
    `;

    document.getElementById('planForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePlan(planId);
    });

    openModal();
}

async function savePlan(planId) {
    const title = document.getElementById('planTitle').value;
    const date = document.getElementById('planDate').value;
    const description = document.getElementById('planDescription').value;

    try {
        if (planId) {
            const plan = appData.plans.find(p => p.id === planId);
            await fetch(`/api/plans/${planId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...plan, title, date, description })
            });
        } else {
            await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, date, description })
            });
        }

        await loadData();
        renderPlans();
        closeModal();
    } catch (error) {
        alert('保存失败');
    }
}

async function completePlan(planId) {
    try {
        const plan = appData.plans.find(p => p.id === planId);
        await fetch(`/api/plans/${planId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...plan, completed: true })
        });
        await loadData();
        renderPlans();
        renderOverview();
    } catch (error) {
        alert('操作失败');
    }
}

async function deletePlan(planId) {
    if (!confirm('确定要删除这个计划吗？')) return;

    try {
        await fetch(`/api/plans/${planId}`, { method: 'DELETE' });
        await loadData();
        renderPlans();
    } catch (error) {
        alert('删除失败');
    }
}

// ===== 章节筛选初始化 =====
function initChapterFilters() {
    const chapterOptions = appData.chapters.map(c =>
        `<option value="${c.id}">${c.name}</option>`
    ).join('');

    const noteFilter = document.getElementById('noteChapterFilter');
    const questionFilter = document.getElementById('questionChapterFilter');

    // 保存当前选中的值
    const noteSelected = noteFilter.value;
    const questionSelected = questionFilter.value;

    noteFilter.innerHTML = `<option value="">所有章节</option>${chapterOptions}`;
    questionFilter.innerHTML = `<option value="">所有章节</option>${chapterOptions}`;

    noteFilter.value = noteSelected;
    questionFilter.value = questionSelected;
}

// ===== 模态框 =====
function openModal() {
    document.getElementById('modalContainer').classList.add('active');
}

function closeModal() {
    document.getElementById('modalContainer').classList.remove('active');
}

// ===== 数据导入导出 =====
async function exportData() {
    try {
        const response = await fetch('/api/export');
        const data = await response.json();

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'study-data.json';
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('导出失败');
    }
}

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });

        await loadData();
        navigateTo('overview');
        alert('导入成功');
    } catch (error) {
        alert('导入失败，请检查文件格式');
    }

    e.target.value = '';
}

// ===== 章节状态更新（模态框） =====
function openChapterModal(chapterId) {
    const chapter = appData.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    document.getElementById('modalTitle').textContent = `章节：${chapter.name}`;

    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label class="form-label">学习状态</label>
            <select class="form-select" id="chapterStatus">
                <option value="pending" ${chapter.status === 'pending' ? 'selected' : ''}>未学</option>
                <option value="studying" ${chapter.status === 'studying' ? 'selected' : ''}>学习中</option>
                <option value="completed" ${chapter.status === 'completed' ? 'selected' : ''}>已完成</option>
            </select>
        </div>
        <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="closeModal()">取消</button>
            <button type="button" class="btn-primary" onclick="updateChapterStatus('${chapterId}')">保存</button>
        </div>
    `;

    openModal();
}

async function updateChapterStatus(chapterId) {
    const status = document.getElementById('chapterStatus').value;

    try {
        await fetch(`/api/chapters/${chapterId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        await loadData();
        renderChapters();
        closeModal();
    } catch (error) {
        alert('更新失败');
    }
}