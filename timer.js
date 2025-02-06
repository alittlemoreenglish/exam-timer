class Timer {
  constructor(display) {
    this.display = display;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;
  }

  start() {
    if (!this.timerInterval) {
      this.startTime = Date.now() - this.elapsedTime;
      this.timerInterval = setInterval(() => this.update(), 10);
    }
  }

  stop() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  reset() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.elapsedTime = 0;
    this.display.textContent = '00:00:00';
  }

  update() {
    this.elapsedTime = Date.now() - this.startTime;
    this.display.textContent = this.formatTime(this.elapsedTime);
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(num => num.toString().padStart(2, '0'))
      .join(':');
  }
}

class ExamTimer {
  constructor() {
    this.digitalClock = document.getElementById('digitalClock');
    this.digitalDate = document.getElementById('digitalDate');
    this.countdownDisplay = document.getElementById('countdownDisplay');
    this.examHoursInput = document.getElementById('examHours');
    this.examMinutesInput = document.getElementById('examMinutesInput');
    this.examNameInput = document.getElementById('examNameInput');
    this.examInfoInput = document.getElementById('examInfoInput');
    
    this.setTimerBtn = document.getElementById('setTimerBtn');
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.resetBtn = document.getElementById('resetBtn');

    this.rightSection = document.querySelector('.right-section');

    this.countdownTimer = null;
    this.remainingTime = 0;
    this.countdownInterval = null;

    this.initializeEventListeners();
    this.updateDigitalClock();
    setInterval(() => this.updateDigitalClock(), 1000);
  }

  initializeEventListeners() {
    this.setTimerBtn.addEventListener('click', () => this.setExamDuration());
    this.startBtn.addEventListener('click', () => this.startExam());
    this.stopBtn.addEventListener('click', () => this.stopExam());
    this.resetBtn.addEventListener('click', () => this.resetExam());
  }

  updateDigitalClock() {
    const now = new Date();
    this.digitalClock.textContent = now.toLocaleTimeString();
    this.digitalDate.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }

  setExamDuration() {
    const hours = parseInt(this.examHoursInput.value) || 0;
    const minutes = parseInt(this.examMinutesInput.value) || 0;
    
    this.remainingTime = (hours * 3600 + minutes * 60) * 1000;
    this.countdownDisplay.textContent = this.formatTime(this.remainingTime);
    
    // Enable start button
    this.startBtn.disabled = false;
    
    // Disable timer inputs
    this.examHoursInput.disabled = true;
    this.examMinutesInput.disabled = true;
    this.setTimerBtn.disabled = true;
  }

  startExam() {
    if (this.remainingTime <= 0) return;

    // Add exam started class
    this.rightSection.classList.add('exam-started');

    // Create exam info display
    const examInfoDiv = document.createElement('div');
    examInfoDiv.classList.add('exam-info');
    examInfoDiv.innerHTML = `
      <div> ${this.examNameInput.value || ' '}</div>
      <div> ${this.examInfoInput.value || ' '}</div>
    `;
    this.rightSection.insertBefore(examInfoDiv, this.rightSection.firstChild);

    // Disable inputs and start buttons
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;

    this.countdownInterval = setInterval(() => {
      this.remainingTime -= 1000;
      
      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this.stopExam();
        alert('Exam time is over!');
      }
      
      this.countdownDisplay.textContent = this.formatTime(this.remainingTime);
    }, 1000);
  }

  stopExam() {
    clearInterval(this.countdownInterval);
    this.stopBtn.disabled = true;
    this.resetBtn.disabled = false;
  }

  resetExam() {
    clearInterval(this.countdownInterval);
    
    // Remove exam started class and exam info
    this.rightSection.classList.remove('exam-started');
    const examInfoDiv = this.rightSection.querySelector('.exam-info');
    if (examInfoDiv) {
      examInfoDiv.remove();
    }
    
    // Reset inputs
    this.examHoursInput.value = '';
    this.examMinutesInput.value = '';
    this.examNameInput.value = '';
    this.examInfoInput.value = '';
    this.countdownDisplay.textContent = '00:00:00';
    
    // Reset button states
    this.examHoursInput.disabled = false;
    this.examMinutesInput.disabled = false;
    this.startBtn.disabled = true;
    this.stopBtn.disabled = true;
    this.resetBtn.disabled = true;
    this.setTimerBtn.disabled = false;
    
    this.remainingTime = 0;
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(num => num.toString().padStart(2, '0'))
      .join(':');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const examTimer = new ExamTimer();
});
