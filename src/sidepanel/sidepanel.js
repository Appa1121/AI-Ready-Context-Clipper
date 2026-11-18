/**
 * Display the honest M1 capability boundary. No storage or clipboard side effects.
 * @returns {void}
 */
function initializePanel() {
  const status = document.getElementById('status');
  if (!status) {
    console.error('AI Clipper: required status element is missing.');
    return;
  }
  status.textContent = 'แผงพร้อมแล้ว · ฟีเจอร์บันทึกและส่งออกยังอยู่ระหว่างพัฒนา';
}

initializePanel();
