'use client';

import { useState } from 'react';
import { AppData } from '@/lib/types';
import * as actions from '@/lib/actions';
import {
  Sidebar,
  Overview,
  StudyRecords,
  StudyRecordForm,
  Rewards,
  Modal,
} from '@/components';

export default function ClientPage({ initialData }: { initialData: AppData }) {
  const [data, setData] = useState<AppData>(initialData);
  const [currentPage, setCurrentPage] = useState('overview');

  // 模态框状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // 刷新数据
  async function refreshData() {
    const result = await actions.exportData();
    setData(result);
  }

  // 模态框操作
  function openModal(title: string, content: React.ReactNode) {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  // 添加学习记录
  function openAddRecordModal() {
    openModal(
      '记录学习',
      <StudyRecordForm
        chapters={data.chapters}
        onSubmit={async (formData) => {
          try {
            const result = await actions.createStudyRecord(formData);
            await refreshData();
            closeModal();
            // 显示获得积分的提示
            alert(`🎉 记录成功！获得 ${result.pointsEarned} 积分！`);
            setCurrentPage('records');
          } catch {
            alert('保存失败');
          }
        }}
        onCancel={closeModal}
      />
    );
  }

  // 删除学习记录
  async function deleteRecord(id: number) {
    if (!confirm('确定要删除这条学习记录吗？积分将被退回。')) return;
    try {
      const result = await actions.deleteStudyRecord(id);
      if (result.success) {
        await refreshData();
        alert(`已删除记录，退回 ${result.pointsReturned} 积分`);
      }
    } catch {
      alert('删除失败');
    }
  }

  // 兑换奖励
  async function redeemReward(rewardId: number) {
    try {
      const result = await actions.redeemReward(rewardId);
      if (result.success) {
        await refreshData();
        alert(`🎉 兑换成功！消耗 ${result.redemption?.cost} 积分`);
      } else {
        alert(result.error || '兑换失败');
      }
    } catch {
      alert('兑换失败');
    }
  }

  // 添加奖励
  async function addReward(reward: { name: string; description: string; cost: number; icon: string }) {
    try {
      await actions.addReward(reward);
      await refreshData();
    } catch {
      alert('添加失败');
    }
  }

  // 删除奖励
  async function deleteReward(id: number) {
    try {
      await actions.deleteReward(id);
      await refreshData();
    } catch {
      alert('删除失败');
    }
  }

  // 导入导出
  async function handleExport() {
    try {
      const exportData = await actions.exportData();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'study-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('导出失败');
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      await actions.importData(jsonData);
      await refreshData();
      alert('导入成功');
    } catch {
      alert('导入失败，请检查文件格式');
    }

    e.target.value = '';
  }

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onExport={handleExport}
        onImport={handleImport}
        availablePoints={data.stats.availablePoints}
      />

      <main className="main-content">
        {/* 概览页面 */}
        <div className={`page ${currentPage === 'overview' ? 'active' : ''}`}>
          <Overview data={data} />
        </div>

        {/* 学习记录页面 */}
        <div className={`page ${currentPage === 'records' ? 'active' : ''}`}>
          <header className="page-header">
            <h1>学习记录</h1>
            <p className="page-subtitle">记录每一次学习的成长</p>
          </header>
          <div className="records-actions">
            <button className="btn-primary" onClick={openAddRecordModal}>
              + 记录学习
            </button>
          </div>
          <StudyRecords records={data.records} onDelete={deleteRecord} />
        </div>

        {/* 积分兑换页面 */}
        <div className={`page ${currentPage === 'rewards' ? 'active' : ''}`}>
          <header className="page-header">
            <h1>积分兑换</h1>
            <p className="page-subtitle">用学习成果兑换奖励</p>
          </header>
          <Rewards
            rewards={data.rewards}
            redemptions={data.redemptions}
            stats={data.stats}
            onRedeem={redeemReward}
            onAddReward={addReward}
            onDeleteReward={deleteReward}
          />
        </div>
      </main>

      <Modal open={modalOpen} title={modalTitle} onClose={closeModal}>
        {modalContent}
      </Modal>
    </div>
  );
}