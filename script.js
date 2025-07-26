class SnakeAdventure {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileCount = 20;
        this.tileSize = this.canvas.width / this.tileCount;
        
        // 游戏状态
        this.gameRunning = false;
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.score = 0;
        this.targetScore = 10;
        this.gameSpeed = 200;
        
        // 蛇的初始状态
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        
        // 食物
        this.food = { x: 15, y: 15, type: 'apple' };
        this.foodTypes = [
            { emoji: '🍎', name: 'apple', color: '#ff4757' },
            { emoji: '🍊', name: 'orange', color: '#ffa502' },
            { emoji: '🍌', name: 'banana', color: '#fffa65' },
            { emoji: '🍇', name: 'grape', color: '#a55eea' },
            { emoji: '🍓', name: 'strawberry', color: '#ff3838' },
            { emoji: '🥝', name: 'kiwi', color: '#7bed9f' },
            { emoji: '🍑', name: 'cherry', color: '#ff4757' },
            { emoji: '🍰', name: 'cake', color: '#ffeaa7' }
        ];
        
        // 触摸控制
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMobileControls();
        this.updateUI();
        this.generateFood();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
            }
        });
        
        // 触摸控制
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning) return;
            
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            if (Math.abs(deltaX) > this.minSwipeDistance || Math.abs(deltaY) > this.minSwipeDistance) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // 水平滑动
                    if (deltaX > 0 && this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    } else if (deltaX < 0 && this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                } else {
                    // 垂直滑动
                    if (deltaY > 0 && this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    } else if (deltaY < 0 && this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                }
            }
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.retryLevel();
        });
        
        // 速度选择
        document.getElementById('speedSelect').addEventListener('change', (e) => {
            this.gameSpeed = parseInt(e.target.value);
        });
    }
    
    setupMobileControls() {
        document.getElementById('upBtn').addEventListener('click', () => {
            if (this.gameRunning && this.dy !== 1) {
                this.dx = 0;
                this.dy = -1;
            }
        });
        
        document.getElementById('downBtn').addEventListener('click', () => {
            if (this.gameRunning && this.dy !== -1) {
                this.dx = 0;
                this.dy = 1;
            }
        });
        
        document.getElementById('leftBtn').addEventListener('click', () => {
            if (this.gameRunning && this.dx !== 1) {
                this.dx = -1;
                this.dy = 0;
            }
        });
        
        document.getElementById('rightBtn').addEventListener('click', () => {
            if (this.gameRunning && this.dx !== -1) {
                this.dx = 1;
                this.dy = 0;
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.hideAllScreens();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        setTimeout(() => {
            this.update();
            this.draw();
            if (this.gameRunning) {
                this.gameLoop();
            }
        }, this.gameSpeed);
    }
    
    update() {
        // 如果蛇还没有开始移动，不进行更新
        if (this.dx === 0 && this.dy === 0) {
            return;
        }
        
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.updateUI();
            this.generateFood();
            
            // 检查是否完成关卡
            if (this.score >= this.targetScore) {
                this.levelComplete();
                return;
            }
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2d5a27';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格背景
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(this.canvas.width, i * this.tileSize);
            this.ctx.stroke();
        }

        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#4ade80';
                this.ctx.fillRect(segment.x * this.tileSize + 2, segment.y * this.tileSize + 2,
                                this.tileSize - 4, this.tileSize - 4);

                // 绘制蛇头的眼睛
                this.ctx.fillStyle = '#000';
                const eyeSize = 3;
                const eyeOffset = 6;
                this.ctx.fillRect(segment.x * this.tileSize + eyeOffset,
                                segment.y * this.tileSize + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(segment.x * this.tileSize + this.tileSize - eyeOffset - eyeSize,
                                segment.y * this.tileSize + eyeOffset, eyeSize, eyeSize);
            } else {
                // 蛇身
                this.ctx.fillStyle = '#22c55e';
                this.ctx.fillRect(segment.x * this.tileSize + 3, segment.y * this.tileSize + 3,
                                this.tileSize - 6, this.tileSize - 6);
            }
        });

        // 绘制食物
        const foodType = this.foodTypes.find(f => f.name === this.food.type);
        this.ctx.font = `${this.tileSize - 4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            foodType.emoji,
            this.food.x * this.tileSize + this.tileSize / 2,
            this.food.y * this.tileSize + this.tileSize - 2
        );
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: this.foodTypes[Math.floor(Math.random() * this.foodTypes.length)].name
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

        this.food = newFood;
    }

    levelComplete() {
        this.gameRunning = false;
        this.createCelebrationEffect();

        if (this.currentLevel >= this.maxLevel) {
            // 游戏通关
            this.showScreen('gameCompleteScreen');
        } else {
            // 关卡完成
            document.getElementById('levelCompleteText').textContent = `第${this.currentLevel}关完成！`;
            this.showScreen('levelCompleteScreen');
        }
    }

    nextLevel() {
        this.currentLevel++;
        this.targetScore = this.currentLevel * 10;
        this.score = 0;
        this.resetSnake();
        this.generateFood();
        this.updateUI();
        this.hideAllScreens();
        this.startGame();
    }

    gameOver() {
        this.gameRunning = false;
        this.showScreen('gameOverScreen');
    }

    retryLevel() {
        this.score = 0;
        this.resetSnake();
        this.generateFood();
        this.updateUI();
        this.hideAllScreens();
        this.startGame();
    }

    restartGame() {
        this.currentLevel = 1;
        this.targetScore = 10;
        this.score = 0;
        this.resetSnake();
        this.generateFood();
        this.updateUI();
        this.hideAllScreens();
        this.startGame();
    }

    resetSnake() {
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
    }

    updateUI() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('targetScore').textContent = this.targetScore;
        document.getElementById('progressText').textContent = `${this.score} / ${this.targetScore}`;

        const progressPercent = (this.score / this.targetScore) * 100;
        document.getElementById('progressFill').style.width = `${progressPercent}%`;
    }

    showScreen(screenId) {
        this.hideAllScreens();
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById(screenId).classList.remove('hidden');
    }

    hideAllScreens() {
        document.getElementById('gameOverlay').style.display = 'none';
        const screens = ['startScreen', 'levelCompleteScreen', 'gameCompleteScreen', 'gameOverScreen'];
        screens.forEach(screenId => {
            document.getElementById(screenId).classList.add('hidden');
        });
    }

    createCelebrationEffect() {
        // 创建彩带效果
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 50);
        }

        // 创建烟花效果
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * 300);
        }
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';

        document.getElementById('celebrationContainer').appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }

    createFirework() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        const centerX = Math.random() * window.innerWidth;
        const centerY = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.1;

        for (let i = 0; i < 12; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = centerX + 'px';
            firework.style.top = centerY + 'px';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            const angle = (i * 30) * Math.PI / 180;
            const distance = 100;
            firework.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;

            document.getElementById('celebrationContainer').appendChild(firework);

            setTimeout(() => {
                firework.remove();
            }, 1000);
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeAdventure();
});
