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
    this.backgroundToggleBtn = document.getElementById('backgroundToggle');
    this.soundToggleBtn = document.getElementById('soundToggle');
    this.zoomInBtn = document.getElementById('zoomIn');
    this.zoomOutBtn = document.getElementById('zoomOut');

    this.examTimerContainer = document.querySelector('.exam-timer-container');
    this.rightSection = document.querySelector('.right-section');

    this.countdownTimer = null;
    this.remainingTime = 0;
    this.countdownInterval = null;
    this.currentBackground = 1;
    this.soundEnabled = false;
    this.alarmSound = new Audio('sound.wav');
    this.zoomLevel = 1;
    this.timerIsSet = false;
    this.examInProgress = false;

    // Initial button states
    this.stopBtn.classList.add('hidden');
    this.resetBtn.disabled = true;
    this.startBtn.disabled = true;

    this.initializeEventListeners();
    this.updateDigitalClock();
    setInterval(() => this.updateDigitalClock(), 1000);
    this.setupInputValidation();
  }

  initializeEventListeners() {
    this.setTimerBtn.addEventListener('click', () => this.setExamDuration());
    this.startBtn.addEventListener('click', () => {
      if (!this.timerIsSet) {
        alert('Please set the timer before starting the exam.');
        return;
      }
      this.startExam();
    });
    this.stopBtn.addEventListener('click', () => this.stopExam());
    this.resetBtn.addEventListener('click', () => this.resetExam());
    this.backgroundToggleBtn.addEventListener('click', () => this.toggleBackground());
    this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
    this.zoomInBtn.addEventListener('click', () => this.zoomIn());
    this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
  }

  setupInputValidation() {
    // Validate that only integers are entered
    const validateInteger = (input) => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value && !Number.isInteger(parseFloat(value))) {
          alert('Please enter only whole numbers (integers).');
          e.target.value = Math.floor(parseFloat(value)) || '';
        }
      });
    };

    validateInteger(this.examHoursInput);
    validateInteger(this.examMinutesInput);
  }

  zoomIn() {
    if (this.zoomLevel < 1.5) {
      this.zoomLevel += 0.1;
      this.updateZoom();
    }
  }

  zoomOut() {
    if (this.zoomLevel > 0.7) {
      this.zoomLevel -= 0.1;
      this.updateZoom();
    }
  }

  updateZoom() {
    this.examTimerContainer.style.transform = `scale(${this.zoomLevel})`;
  }

  toggleBackground() {
    this.currentBackground = this.currentBackground === 1 ? 2 : 1;
    if (this.currentBackground === 2) {
      document.body.classList.add('background-2');
    } else {
      document.body.classList.remove('background-2');
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      this.soundToggleBtn.textContent = 'Sound Effect: On';
      this.soundToggleBtn.classList.add('active');
    } else {
      this.soundToggleBtn.textContent = 'Sound Effect: Off';
      this.soundToggleBtn.classList.remove('active');
    }
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
    
    // Validate inputs
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
      alert('Please enter only whole numbers (integers).');
      return;
    }

    if (hours === 0 && minutes === 0) {
      alert('Please enter a valid exam duration.');
      return;
    }
    
    this.remainingTime = (hours * 3600 + minutes * 60) * 1000;
    this.countdownDisplay.textContent = this.formatTime(this.remainingTime);
    
    // Set timer state to ready
    this.timerIsSet = true;
    
    // Enable start button and reset button, hide stop button
    this.startBtn.disabled = false;
    this.resetBtn.disabled = false;
    this.stopBtn.classList.add('hidden');
    
    // Disable timer inputs
    this.examHoursInput.disabled = true;
    this.examMinutesInput.disabled = true;
    this.setTimerBtn.disabled = true;
  }

  startExam() {
    if (this.remainingTime <= 0) return;
    
    this.examInProgress = true;

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

    // Update button visibility
    this.startBtn.classList.add('hidden');
    this.stopBtn.classList.remove('hidden');
    this.stopBtn.disabled = false;
    this.resetBtn.classList.add('hidden');

    this.countdownInterval = setInterval(() => {
      this.remainingTime -= 1000;
      
      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this.stopExam();
        
        // Play sound if enabled before showing the alert
        if (this.soundEnabled) {
          this.playAlarmSound();
        }
        
        alert('Exam time is over!');
      }
      
      this.countdownDisplay.textContent = this.formatTime(this.remainingTime);
    }, 1000);
  }

  playAlarmSound() {
    // Reset the audio to the beginning if it was already played
    this.alarmSound.currentTime = 0;
    
    // Play the sound
    this.alarmSound.play().catch(error => {
      console.error("Error playing sound:", error);
    });
  }

  stopExam() {
    clearInterval(this.countdownInterval);
    this.examInProgress = false;
    
    // Change button visibility - stop transforms into reset
    this.stopBtn.classList.add('hidden');
    this.resetBtn.classList.remove('hidden');
    this.resetBtn.disabled = false;
  }

  resetExam() {
    clearInterval(this.countdownInterval);
    
    // Remove exam started class and exam info if exam was in progress
    if (this.examInProgress) {
      this.rightSection.classList.remove('exam-started');
      const examInfoDiv = this.rightSection.querySelector('.exam-info');
      if (examInfoDiv) {
        examInfoDiv.remove();
      }
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
    this.startBtn.classList.remove('hidden');
    this.stopBtn.classList.add('hidden');
    this.stopBtn.disabled = true;
    this.resetBtn.disabled = true;
    this.setTimerBtn.disabled = false;
    
    // Reset timer states
    this.remainingTime = 0;
    this.timerIsSet = false;
    this.examInProgress = false;
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
