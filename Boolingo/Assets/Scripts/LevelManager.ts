// LevelManager.ts
// Place on: LevelManager SceneObject (at scene root)
//
// INSPECTOR CONNECTIONS:
//   introPanel      → UIRoot/IntroPanel SceneObject
//   quizPanel       → UIRoot/QuizPanel SceneObject
//   practicePanel   → UIRoot/PracticePanel SceneObject
//   completePanel   → UIRoot/CompletePanel SceneObject
//
//   progressText    → UIRoot/HUD/ProgressText (Text component)
//   progressBarFill → UIRoot/HUD/ProgressBarFill SceneObject
//   scoreText       → UIRoot/HUD/ScoreText (Text component)
//
//   completeTitleText  → UIRoot/CompletePanel/CompleteTitleText
//   completeScoreText  → UIRoot/CompletePanel/CompleteScoreText
//   completeXPText     → UIRoot/CompletePanel/CompleteXPText
//
//   startPinch      → PinchButton component on IntroPanel/StartButton
//   playAgainPinch  → PinchButton component on CompletePanel/PlayAgainButton
//
//   quizControllerSO    → UIRoot/QuizPanel SceneObject
//   practiceControllerSO→ UIRoot/PracticePanel SceneObject
//   ghostControllerSO   → BooGhost SceneObject

import { PinchButton } from 'SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton';
import { WordEntry, LEVEL_1_GREETINGS } from './VocabularyData';

@component
export class LevelManager extends BaseScriptComponent {

  // Panels
  @input introPanel: SceneObject;
  @input quizPanel: SceneObject;
  @input practicePanel: SceneObject;
  @input completePanel: SceneObject;

  // HUD
  @input progressText: Text;
  @input progressBarFill: SceneObject;
  @input scoreText: Text;

  // Complete panel text
  @input completeTitleText: Text;
  @input completeScoreText: Text;
  @input completeXPText: Text;

  // Buttons as PinchButton components (drag the button SceneObject onto these)
  @input startPinch: PinchButton;
  @input playAgainPinch: PinchButton;

  // Controller SceneObjects
  @input quizControllerSO: SceneObject;
  @input practiceControllerSO: SceneObject;
  @input ghostControllerSO: SceneObject;

  private words: WordEntry[] = LEVEL_1_GREETINGS;
  private currentIndex: number = 0;
  private score: number = 0;

  private quizCtrl: any;
  private practiceCtrl: any;
  private ghostCtrl: any;

  onAwake(): void {
    this.quizCtrl     = this.quizControllerSO.getComponent('ScriptComponent');
    this.practiceCtrl = this.practiceControllerSO.getComponent('ScriptComponent');
    this.ghostCtrl    = this.ghostControllerSO.getComponent('ScriptComponent');

    this.showPanel('intro');

    // Wire buttons after all components have awakened
    this.createEvent('OnStartEvent').bind(() => this.wirePinchButtons());
  }

  private wirePinchButtons(): void {
    if (this.startPinch) {
      this.startPinch.onButtonPinched.add(() => this.onStartPinched());
    } else {
      print('[LevelManager] startPinch not connected in Inspector');
    }

    if (this.playAgainPinch) {
      this.playAgainPinch.onButtonPinched.add(() => this.onPlayAgainPinched());
    } else {
      print('[LevelManager] playAgainPinch not connected in Inspector');
    }

    // Safe to set ghost idle now that everything is wired
    if (this.ghostCtrl) this.ghostCtrl.setState('idle');
  }

  // ── Called by QuizController ──────────────────────────────

  onQuizCorrect(): void {
    this.score += 10;
    this.updateHUD();
    if (this.ghostCtrl) this.ghostCtrl.setState('happy');
    this.delay(1.2, () => this.goToPractice());
  }

  onQuizWrong(): void {
    if (this.ghostCtrl) this.ghostCtrl.setState('sad');
  }

  // ── Called by PracticeController ──────────────────────────

  onPracticeCorrect(): void {
    this.score += 10;
    this.updateHUD();
    if (this.ghostCtrl) this.ghostCtrl.setState('celebrate');
    this.delay(1.5, () => this.advanceWord());
  }

  onPracticeSkip(): void {
    if (this.ghostCtrl) this.ghostCtrl.setState('idle');
    this.advanceWord();
  }

  // ── Private flow ──────────────────────────────────────────

  private onStartPinched(): void {
    this.currentIndex = 0;
    this.score        = 0;
    this.updateHUD();
    this.goToQuiz();
  }

  private onPlayAgainPinched(): void {
    this.currentIndex = 0;
    this.score        = 0;
    this.updateHUD();
    this.goToQuiz();
  }

  private goToQuiz(): void {
    this.showPanel('quiz');
    if (this.quizCtrl) this.quizCtrl.loadWord(this.words[this.currentIndex]);
    if (this.ghostCtrl) this.ghostCtrl.setState('idle');
  }

  private goToPractice(): void {
    this.showPanel('practice');
    if (this.practiceCtrl) this.practiceCtrl.loadWord(this.words[this.currentIndex]);
    if (this.ghostCtrl) this.ghostCtrl.setState('listening');
  }

  private advanceWord(): void {
    this.currentIndex++;
    if (this.currentIndex >= this.words.length) {
      this.showComplete();
    } else {
      this.goToQuiz();
    }
  }

  private showComplete(): void {
    this.showPanel('complete');
    if (this.ghostCtrl) this.ghostCtrl.setState('celebrate');
    const maxScore = this.words.length * 20;
    if (this.completeTitleText)  this.completeTitleText.text  = '🎉 Level 1 Complete!';
    if (this.completeScoreText)  this.completeScoreText.text  = this.score + ' / ' + maxScore + ' points';
    if (this.completeXPText)     this.completeXPText.text     = '+' + this.score + ' XP earned';
  }

  private showPanel(which: 'intro' | 'quiz' | 'practice' | 'complete'): void {
    if (this.introPanel)    this.introPanel.enabled    = which === 'intro';
    if (this.quizPanel)     this.quizPanel.enabled     = which === 'quiz';
    if (this.practicePanel) this.practicePanel.enabled = which === 'practice';
    if (this.completePanel) this.completePanel.enabled = which === 'complete';
  }

  private updateHUD(): void {
    const shown = Math.min(this.currentIndex + 1, this.words.length);
    if (this.progressText) this.progressText.text = 'Word ' + shown + ' of ' + this.words.length;
    if (this.scoreText)    this.scoreText.text    = this.score + ' pts';

    if (this.progressBarFill) {
      const t = this.progressBarFill.getTransform();
      const s = t.getLocalScale();
      t.setLocalScale(new vec3(shown / this.words.length, s.y, s.z));
    }
  }

  private delay(sec: number, fn: () => void): void {
    const ev = this.createEvent('DelayedCallbackEvent');
    ev.bind(fn);
    ev.reset(sec);
  }
}