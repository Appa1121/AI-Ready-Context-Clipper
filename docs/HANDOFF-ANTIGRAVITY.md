# ส่งมอบให้ Antigravity / Gemini Argon

ชุดนี้เป็น **M1 candidate ในเครื่อง** พร้อมเอกสารเตรียมงาน M1–M5 ไม่ใช่ checkout ที่ยืนยันกับ GitHub แล้ว และยังไม่มี PR/commit SHA

## Prompt พร้อมใช้

```text
คุณคือ Gemini Argon — Delivery & Integration Lead ผ่าน Antigravity
รับชุดไฟล์นี้เป็น bootstrap candidate ของ AI-Ready Context Clipper

Repo: https://github.com/Appa1121/AI-Ready-Context-Clipper.git

อ่านก่อน:
AGENTS.md
PLAN.md
docs/reports/BOOTSTRAP-report.md
docs/CONTRACTS.md
docs/WORKFLOW.md
docs/tasks/TASK-001.md ถึง TASK-003.md

Codex เตรียมเอกสารทีม, task specs 15 งาน, Contract, M1 scaffold,
tests และ CI ในโฟลเดอร์ที่ยังไม่มี Git checkout
อย่าถือว่าไฟล์นี้ตรงกับ remote หรือเป็นงานที่ merge แล้ว

1. ตรวจ remote/default branch/history และงานค้างของ Appa
2. Clone หากจำเป็นผ่าน Antigravity และสร้าง chore/m1-foundation
   จาก base ที่ตรวจสอบแล้ว ห้าม git init ทดแทน remote ที่เข้าไม่ได้
3. เปรียบเทียบก่อนนำเข้าไฟล์ รักษางานเดิม ไม่คัดลอกทับทั้ง repo
4. ให้ Astra/Argon ตรวจ Contract clarifications ใน bootstrap report
5. รัน node scripts/check.mjs และ node --test
6. ให้ Hydrogen/Appa ทดสอบ Chrome จริงตาม docs/TESTING.md เฉพาะ M1
7. ใส่ source SHA และ spec SHA จริงใน Handoff หลังมี commit
   ห้ามแต่ง SHA หรือแก้ spec เพื่อไล่ตาม SHA ของตัวมันเอง
8. สร้าง Issues/PR ผ่าน Antigravity พร้อม test evidence
9. อัปเดต PLAN ตามหลักฐานจริง รอ Appa อนุมัติก่อน merge
10. หลัง M1 merge จึงเตรียม TASK-004 ให้ Hydrogen
    และ TASK-005 ให้ Sol โดยระบุ allowed files ไม่ทับกัน

M1 นี้ยังไม่มี capture/storage/CRUD/export implementation
อย่าสร้างความเข้าใจว่า MVP ทั้งหมดเสร็จแล้ว
Sol ไม่ต้อง push, เปิด PR หรือแก้สถานะ GitHub
Public Repo ใช้เป็นแหล่งอ่านกลางโดย pin commit SHA
หาก Agent อ่านไม่ได้ ให้ snapshot ของ SHA เดียวกันผ่าน Appa

รายงานกลับ:
branch/base SHA, changed files, actual tests,
browser NOT RUN/ผลจริง, blockers, PR link และ next action
```

## ข้อที่ต้องรักษา
- เฉพาะ Antigravity ทำ Git/GitHub operations
- Appa อนุมัติก่อน merge
- Argon คุม delivery; Astra คุม Contract/architecture
- Hydrogen/Sol ลงมือคนละ scope ไม่เกินสองงานพร้อมกัน
- เก็บข้อมูล/fixtures จริงของผู้ใช้ออกจาก Public Repo
- Future tasks ที่ยังไม่ pin SHA หรือยังมี dependency ไม่ใช่งาน READY
