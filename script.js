// Dexxter Services Recruitment Platform
class RecruitmentApp {
    constructor() {
        this.currentSection = 1;
        this.currentQuestion = 1;
        this.totalQuestions = 8;
        this.skipsRemaining = 5;
        this.answers = {};
        this.skippedQuestions = new Set();
        this.answeredQuestions = new Set();
        this.timers = {
            session: new Timer('sessionTimer'),
            test: new Timer('testTimer')
        };
        this.isSubmitting = false;
        
        this.questions = [
            {
                id: 1,
                text: "Expliquez la différence entre les RemoteEvents et les RemoteFunctions dans Roblox. Donnez un exemple concret d'utilisation pour chaque cas.",
                points: 5,
                requiresText: true,
                requiresCode: false
            },
            {
                id: 2,
                text: "Créez une fonction qui permet de détecter si un joueur utilise un exploit basique (speed hack). Incluez la détection et la prévention.",
                points: 8,
                requiresText: true,
                requiresCode: true
            },
            {
                id: 3,
                text: "Qu'est-ce que les métaméthodes Lua (__index, __namecall, __newindex) et comment sont-elles utilisées dans l'exploitation Roblox ?",
                points: 6,
                requiresText: true,
                requiresCode: false
            },
            {
                id: 4,
                text: "Implémentez un système de sauvegarde des données joueur sécurisé avec DataStores, incluant la gestion des erreurs et la validation.",
                points: 7,
                requiresText: false,
                requiresCode: true
            },
            {
                id: 5,
                text: "Comment fonctionne le hooking de fonctions et quelles sont les meilleures pratiques pour éviter la détection par les anti-cheats ?",
                points: 6,
                requiresText: true,
                requiresCode: false
            },
            {
                id: 6,
                text: "Créez un système de GUI sécurisé qui résiste aux détections et suppressions. Incluez la protection basique.",
                points: 7,
                requiresText: true,
                requiresCode: true
            },
            {
                id: 7,
                text: "Expliquez le concept de 'checkcaller' et son importance dans le développement d'exploits sécurisés.",
                points: 5,
                requiresText: true,
                requiresCode: false
            },
            {
                id: 8,
                text: "Développez un système de téléportation intelligent qui évite les détections tout en maintenant une expérience fluide.",
                points: 8,
                requiresText: false,
                requiresCode: true
            }
        ];

        this.init();
    }

    init() {
        this.hideLoadingScreen();
        this.timers.session.start();
        this.loadProgress();
        this.setupEventListeners();
        this.updateNavigation();
        
        // Afficher la notification de bienvenue
        setTimeout(() => {
            this.showNotification('Bienvenue sur la plateforme de recrutement Dexxter Services', 'success');
        }, 1000);
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);
    }

    setupEventListeners() {
        // Empêcher la fermeture accidentelle
        window.addEventListener('beforeunload', (e) => {
            if (this.currentSection > 1 && !this.isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
                return 'Votre progression sera perdue si vous quittez cette page.';
            }
        });

        // Sauvegarde automatique
        setInterval(() => {
            this.saveProgress();
        }, 30000); // Toutes les 30 secondes

        // Surveillance des changements d'onglet
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.logActivity('Tab switch detected');
            }
        });
    }

    // Navigation entre sections
    showSection(sectionNumber) {
        // Masquer toutes les sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Afficher la section demandée
        const sectionId = ['welcomeSection', 'profileSection', 'testSection', 'submissionSection'][sectionNumber - 1];
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }

        this.currentSection = sectionNumber;
        this.updateNavigation();
        this.updateProgress();

        // Actions spécifiques à chaque section
        if (sectionNumber === 3) {
            this.startTest();
        } else if (sectionNumber === 4) {
            this.showResults();
        }
    }

    nextSection() {
        if (this.currentSection < 4) {
            this.showSection(this.currentSection + 1);
        }
    }

    previousSection() {
        if (this.currentSection > 1) {
            this.showSection(this.currentSection - 1);
        }
    }

    updateNavigation() {
        // Mettre à jour les étapes de progression
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index < this.currentSection) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Mettre à jour la barre de progression
        const progress = ((this.currentSection - 1) / 3) * 100;
        const progressFill = document.getElementById('mainProgressFill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    updateProgress() {
        const progress = 25 + ((this.answeredQuestions.size + (this.currentSection - 2) * 2) / 10) * 75;
        const progressFill = document.getElementById('mainProgressFill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(progress, 100)}%`;
        }
    }

    // Gestion du profil
    validateProfile() {
        const requiredFields = ['fullName', 'robloxUsername', 'discordId', 'age', 'experience', 'motivation'];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                this.showNotification(`Veuillez remplir le champ: ${field}`, 'error');
                element?.focus();
                return false;
            }
        }

        // Validation de l'âge
        const age = parseInt(document.getElementById('age').value);
        if (age < 16 || age > 99) {
            this.showNotification('L\'âge doit être compris entre 16 et 99 ans', 'error');
            return false;
        }

        // Validation de la motivation
        const motivation = document.getElementById('motivation').value;
        if (motivation.trim().length < 50) {
            this.showNotification('Veuillez fournir une motivation plus détaillée (au moins 50 caractères)', 'warning');
            return false;
        }

        this.showNotification('Profil validé avec succès', 'success');
        setTimeout(() => {
            this.nextSection();
        }, 1000);
        
        return true;
    }

    // Gestion du test technique
    startTest() {
        this.timers.test.start();
        this.loadQuestion(1);
        this.updateTestUI();
    }

    loadQuestion(questionNumber) {
        this.currentQuestion = questionNumber;
        const question = this.questions[questionNumber - 1];
        const container = document.getElementById('questionContainer');

        if (!container || !question) return;

        const isSkipped = this.skippedQuestions.has(questionNumber);
        const isAnswered = this.answeredQuestions.has(questionNumber);

        container.innerHTML = `
            <div class="question-header">
                <div class="question-title">Question ${questionNumber}</div>
                <div class="question-points">${question.points} points</div>
            </div>
            <div class="question-content">
                <div class="question-text">${question.text}</div>
                
                ${question.requiresText ? `
                <div class="answer-section">
                    <label>Réponse Texte</label>
                    <textarea class="text-answer" rows="6" 
                              placeholder="Expliquez votre réponse en détail..."
                              oninput="app.saveAnswer(${questionNumber}, 'text', this.value)">${this.getAnswer(questionNumber, 'text') || ''}</textarea>
                </div>
                ` : ''}
                
                ${question.requiresCode ? `
                <div class="answer-section">
                    <label>Code Lua</label>
                    <textarea class="code-answer" rows="12" 
                              placeholder="Écrivez votre code Lua ici..."
                              oninput="app.saveAnswer(${questionNumber}, 'code', this.value)">${this.getAnswer(questionNumber, 'code') || ''}</textarea>
                    <button class="btn btn-outline code-editor-btn" onclick="openCodeEditor()">
                        <i class="fas fa-code"></i>
                        Ouvrir l'éditeur avancé
                    </button>
                </div>
                ` : ''}
                
                ${isSkipped ? `
                <div style="background: var(--warning); color: black; padding: 1rem; border-radius: var(--radius); margin-top: 1rem;">
                    <i class="fas fa-forward"></i>
                    Cette question a été passée
                </div>
                ` : ''}
                
                ${isAnswered ? `
                <div style="background: var(--success); color: white; padding: 1rem; border-radius: var(--radius); margin-top: 1rem;">
                    <i class="fas fa-check"></i>
                    Réponse sauvegardée
                </div>
                ` : ''}
            </div>
        `;

        this.updateTestUI();
    }

    saveAnswer(questionId, type, value) {
        if (!this.answers[questionId]) {
            this.answers[questionId] = {};
        }
        this.answers[questionId][type] = value;
        this.answeredQuestions.add(questionId);
        
        // Retirer des questions passées si maintenant répondue
        if (this.skippedQuestions.has(questionId)) {
            this.skippedQuestions.delete(questionId);
        }
        
        this.updateTestUI();
        this.saveProgress();
    }

    getAnswer(questionId, type) {
        return this.answers[questionId]?.[type] || '';
    }

    nextQuestion() {
        // Validation basique de la question courante
        const currentQuestion = this.questions[this.currentQuestion - 1];
        const currentAnswer = this.answers[this.currentQuestion];

        if (currentQuestion.requiresText && (!currentAnswer?.text || currentAnswer.text.trim().length < 10)) {
            this.showNotification('Veuillez fournir une réponse plus détaillée avant de continuer', 'warning');
            return;
        }

        if (currentQuestion.requiresCode && (!currentAnswer?.code || currentAnswer.code.trim().length < 5)) {
            this.showNotification('Veuillez compléter le code avant de continuer', 'warning');
            return;
        }

        if (this.currentQuestion < this.totalQuestions) {
            this.loadQuestion(this.currentQuestion + 1);
        } else {
            this.finishTest();
        }
    }

    skipQuestion() {
        if (this.skipsRemaining <= 0) {
            this.showNotification('Plus de passages disponibles', 'error');
            return;
        }

        this.skippedQuestions.add(this.currentQuestion);
        this.skipsRemaining--;
        this.updateTestUI();

        this.showNotification(`Question passée. Il vous reste ${this.skipsRemaining} passage(s)`, 'info');

        if (this.currentQuestion < this.totalQuestions) {
            this.loadQuestion(this.currentQuestion + 1);
        } else {
            this.finishTest();
        }
    }

    finishTest() {
        if (this.skippedQuestions.size > 0) {
            // Retourner à la première question passée
            const skipped = Array.from(this.skippedQuestions)[0];
            this.loadQuestion(skipped);
            this.skippedQuestions.delete(skipped);
            this.showNotification(`Retour à la question ${skipped} précédemment passée`, 'info');
        } else {
            this.showSection(4);
        }
    }

    updateTestUI() {
        // Mettre à jour les compteurs
        document.getElementById('currentQuestion').textContent = this.currentQuestion;
        document.getElementById('totalQuestions').textContent = this.totalQuestions;
        document.getElementById('answeredCount').textContent = this.answeredQuestions.size;
        document.getElementById('skipsUsed').textContent = 5 - this.skipsRemaining;
        document.getElementById('skipCount').textContent = this.skipsRemaining;

        // Mettre à jour le bouton de skip
        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.disabled = this.skipsRemaining <= 0;
        }

        // Mettre à jour le bouton suivant
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) {
            if (this.currentQuestion === this.totalQuestions && this.skippedQuestions.size === 0) {
                nextBtn.innerHTML = 'Terminer le Test <i class="fas fa-flag-checkered"></i>';
            } else {
                nextBtn.innerHTML = 'Question Suivante <i class="fas fa-arrow-right"></i>';
            }
        }

        this.updateProgress();
    }

    // Résultats et soumission
    showResults() {
        this.timers.test.stop();
        
        const completionRate = Math.round((this.answeredQuestions.size / this.totalQuestions) * 100);
        const timeSpent = this.timers.test.getElapsedTime();
        
        document.getElementById('completionRate').textContent = completionRate + '%';
        document.getElementById('timeSpent').textContent = timeSpent;
        document.getElementById('questionsAnswered').textContent = this.answeredQuestions.size;

        // Afficher le résumé du profil
        this.displayProfileSummary();
    }

    displayProfileSummary() {
        const profileSummary = document.getElementById('profileSummary');
        if (!profileSummary) return;

        const profile = {
            name: document.getElementById('fullName')?.value || 'Non renseigné',
            roblox: document.getElementById('robloxUsername')?.value || 'Non renseigné',
            discord: document.getElementById('discordId')?.value || 'Non renseigné',
            experience: document.getElementById('experience')?.value || 'Non renseigné'
        };

        profileSummary.innerHTML = `
            <div class="profile-detail">
                <span>Nom:</span>
                <strong>${profile.name}</strong>
            </div>
            <div class="profile-detail">
                <span>Roblox:</span>
                <strong>${profile.roblox}</strong>
            </div>
            <div class="profile-detail">
                <span>Discord:</span>
                <strong>${profile.discord}</strong>
            </div>
            <div class="profile-detail">
                <span>Expérience:</span>
                <strong>${this.getExperienceLabel(profile.experience)}</strong>
            </div>
        `;
    }

    getExperienceLabel(experience) {
        const labels = {
            'debutant': 'Débutant (0-1 an)',
            'intermediaire': 'Intermédiaire (1-3 ans)',
            'avance': 'Avancé (3-5 ans)',
            'expert': 'Expert (5+ ans)'
        };
        return labels[experience] || experience;
    }

    async submitApplication() {
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Soumission en cours...';
            submitBtn.disabled = true;

            // Simuler l'envoi des données
            await this.sendApplicationData();

            this.showNotification('🎉 Candidature soumise avec succès !', 'success');
            
            // Mettre à jour l'interface
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Soumis avec succès';
            submitBtn.style.background = 'var(--success)';

            // Désactiver les interactions
            document.querySelectorAll('button').forEach(btn => {
                if (btn !== submitBtn) btn.disabled = true;
            });

            // Effacer la progression locale
            localStorage.removeItem('dexxter_recruitment_progress');

        } catch (error) {
            console.error('Erreur de soumission:', error);
            this.showNotification('Erreur lors de la soumission. Veuillez réessayer.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        } finally {
            this.isSubmitting = false;
        }
    }

    async sendApplicationData() {
        // Simuler l'envoi des données
        return new Promise((resolve) => {
            setTimeout(() => {
                // Ici, on enverrait les données au webhook Discord
                this.sendToDiscord();
                resolve();
            }, 2000);
        });
    }

    sendToDiscord() {
        const webhookURL = 'https://discord.com/api/webhooks/1392061559202779186/6Bw4CMy4HLBoTygCfLKpImVfr0QgUODNHMY_10BTRklXVoaj91H5-2U4pDE8wdbgy1m1';
        
        const profile = {
            name: document.getElementById('fullName')?.value,
            roblox: document.getElementById('robloxUsername')?.value,
            discord: document.getElementById('discordId')?.value,
            experience: document.getElementById('experience')?.value
        };

        const embed = {
            title: "🎯 Nouvelle Candidature Dexxter Services",
            color: 0x00ff00,
            fields: [
                {
                    name: "👤 Candidat",
                    value: `**Nom:** ${profile.name}\n**Roblox:** ${profile.roblox}\n**Discord:** ${profile.discord}\n**Expérience:** ${this.getExperienceLabel(profile.experience)}`,
                    inline: false
                },
                {
                    name: "📊 Performance",
                    value: `**Questions répondues:** ${this.answeredQuestions.size}/${this.totalQuestions}\n**Temps passé:** ${this.timers.test.getElapsedTime()}\n**Passages utilisés:** ${5 - this.skipsRemaining}`,
                    inline: true
                },
                {
                    name: "⏰ Session",
                    value: `**Début:** ${new Date(this.timers.test.startTime).toLocaleString('fr-FR')}\n**Fin:** ${new Date().toLocaleString('fr-FR')}`,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "Dexxter Services Recruitment"
            }
        };

        // Envoyer au webhook Discord
        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] })
        }).catch(error => {
            console.error('Erreur webhook Discord:', error);
        });
    }

    // Gestion de la progression
    saveProgress() {
        const progress = {
            currentSection: this.currentSection,
            currentQuestion: this.currentQuestion,
            answers: this.answers,
            skipsRemaining: this.skipsRemaining,
            skippedQuestions: Array.from(this.skippedQuestions),
            answeredQuestions: Array.from(this.answeredQuestions),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('dexxter_recruitment_progress', JSON.stringify(progress));
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('dexxter_recruitment_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                
                this.currentSection = progress.currentSection || 1;
                this.currentQuestion = progress.currentQuestion || 1;
                this.answers = progress.answers || {};
                this.skipsRemaining = progress.skipsRemaining || 5;
                this.skippedQuestions = new Set(progress.skippedQuestions || []);
                this.answeredQuestions = new Set(progress.answeredQuestions || []);

                this.showSection(this.currentSection);
                
                if (this.currentSection === 3) {
                    this.loadQuestion(this.currentQuestion);
                    this.updateTestUI();
                }

                this.showNotification('Progression précédente chargée', 'info');
                return true;
            }
        } catch (error) {
            console.error('Erreur chargement progression:', error);
        }
        return false;
    }

    // Utilitaires
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notificationMessage');
        
        if (!notification || !messageEl) return;

        messageEl.textContent = message;
        
        // Définir la couleur selon le type
        const colors = {
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--primary)'
        };
        
        notification.style.borderLeftColor = colors[type] || colors.info;
        notification.style.display = 'block';

        // Masquer automatiquement après 5 secondes
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    hideNotification() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.style.display = 'none';
        }
    }

    logActivity(message) {
        console.log(`[Dexxter Recruitment] ${message}`);
    }
}

// Classe Timer
class Timer {
    constructor(displayElementId) {
        this.displayElementId = displayElementId;
        this.startTime = null;
        this.interval = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now();
        this.isRunning = true;
        
        this.interval = setInterval(() => {
            this.updateDisplay();
        }, 1000);
        
        this.updateDisplay();
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    updateDisplay() {
        const element = document.getElementById(this.displayElementId);
        if (element) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            
            element.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    getElapsedTime() {
        if (!this.startTime) return '00:00:00';
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Éditeur de code
function openCodeEditor() {
    const modal = document.getElementById('codeEditorModal');
    const currentCode = document.querySelector('.code-answer')?.value || '';
    
    document.getElementById('codeEditor').value = currentCode;
    modal.style.display = 'block';
}

function closeCodeEditor() {
    document.getElementById('codeEditorModal').style.display = 'none';
}

function applyCode() {
    const code = document.getElementById('codeEditor').value;
    const currentCodeAnswer = document.querySelector('.code-answer');
    
    if (currentCodeAnswer) {
        currentCodeAnswer.value = code;
        app.saveAnswer(app.currentQuestion, 'code', code);
    }
    
    closeCodeEditor();
    app.showNotification('Code appliqué avec succès', 'success');
}

function insertTemplate(type) {
    const editor = document.getElementById('codeEditor');
    let template = '';

    switch (type) {
        case 'function':
            template = `-- Template de fonction
local function maFonction(parametre)
    -- Votre code ici
    local resultat = parametre * 2
    return resultat
end

return maFonction`;
            break;
        case 'hook':
            template = `-- Template de hook
local originalFunction
originalFunction = hookmetamethod(game, "__namecall", function(self, ...)
    local args = {...}
    local method = getnamecallmethod()
    
    if method == "FireServer" and self.Name == "RemoteEvent" then
        -- Votre logique de hook ici
        print("RemoteEvent appelé:", ...)
    end
    
    return originalFunction(self, unpack(args))
end)`;
            break;
    }

    editor.value += '\n\n' + template;
}

function formatCode() {
    const editor = document.getElementById('codeEditor');
    let code = editor.value;
    
    // Formatage basique
    code = code.replace(/\t/g, '    ');
    code = code.replace(/\n{3,}/g, '\n\n');
    
    editor.value = code;
    app.showNotification('Code formaté', 'info');
}

// Aide et support
function showHelp() {
    document.getElementById('helpModal').style.display = 'block';
}

function closeHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

function contactAdmin() {
    app.showNotification('Fonctionnalité de contact administrateur', 'info');
    closeHelp();
}

// Plein écran
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Erreur plein écran:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Fonctions globales pour HTML
function nextSection() {
    app.nextSection();
}

function previousSection() {
    app.previousSection();
}

function validateProfile() {
    app.validateProfile();
}

function nextQuestion() {
    app.nextQuestion();
}

function skipQuestion() {
    app.skipQuestion();
}

function saveProgress() {
    app.saveProgress();
    app.showNotification('Progression sauvegardée', 'success');
}

function submitApplication() {
    app.submitApplication();
}

// Initialiser l'application
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new RecruitmentApp();
    
    // Raccourcis clavier
    document.addEventListener('keydown', function(e) {
        // Ctrl+S pour sauvegarder
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProgress();
        }
        
        // Échap pour fermer les modals
        if (e.key === 'Escape') {
            closeCodeEditor();
            closeHelp();
        }
    });
});

// Empêcher la fermeture accidentelle
window.addEventListener('beforeunload', function(e) {
    if (app && app.currentSection > 1 && !app.isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
    }
});
