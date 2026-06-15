// QuizController.ts
// Place on: QuizPanel SceneObject
//
// INSPECTOR CONNECTIONS:
//   instructionText → Text on QuizPanel
//   hindiWordText   → Text (large, shows Devanagari)
//   romanizedText   → Text (smaller, shows romanized)
//
//   optionPinchA/B/C/D → PinchButton component on each OptionButton SceneObject
//   optionTextA/B/C/D  → Text component inside each OptionButton
//   optionBgA/B/C/D    → Image component (background) inside each OptionButton
//
//   replayPinch     → PinchButton component on ReplayButton SceneObject
//
//   ttsScriptObj    → AudioManager SceneObject (has HindiTTS script)
//   levelManagerObj → LevelManager SceneObject

import { PinchButton } from 'SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton';
import { WordEntry } from './VocabularyData';

@component
export class QuizController extends BaseScriptComponent {

  // --- Text ---
  @input instructionText: Text;
  @input hindiWordText: Text;
  @input romanizedText: Text;

  // --- Option buttons: PinchButton components ---
  @input optionPinchA: PinchButton;
  @input optionPinchB: PinchButton;
  @input optionPinchC: PinchButton;
  @input optionPinchD: PinchButton;

  // --- Option buttons: Text labels ---
  @input optionTextA: Text;
  @input optionTextB: Text;
  @input optionTextC: Text;
  @input optionTextD: Text;

  // --- Option buttons: Image backgrounds ---
  @input optionBgA: Image;
  @input optionBgB: Image;
  @input optionBgC: Image;
  @input optionBgD: Image;

  // --- Replay button ---
  @input replayPinch: PinchButton;

  // --- Cross-script ---
  @input ttsScriptObj: SceneObject;
  @input levelManagerObj: SceneObject;

  private readonly COL_DEFAULT = new vec4(0.12, 0.12, 0.12, 0.88);
  private readonly COL_CORRECT = new vec4(0.10, 0.80, 0.25, 1.00);
  private readonly COL_WRONG   = new vec4(0.82, 0.12, 0.12, 1.00);

  private tts: any;
  private levelMgr: any;
  private currentWord: WordEntry | null = null;
  private shuffledOptions: string[] = [];
  private correctIndex: number = 0;
  private answered: boolean = false;

  private pinches: PinchButton[] = [];
  private texts: Text[] = [];
  private bgs: Image[] = [];

  onAwake(): void {
    this.tts      = this.ttsScriptObj.getComponent('ScriptComponent');
    this.levelMgr = this.levelManagerObj.getComponent('ScriptComponent');

    this.pinches = [this.optionPinchA, this.optionPinchB,
                    this.optionPinchC, this.optionPinchD];
    this.texts   = [this.optionTextA,  this.optionTextB,
                    this.optionTextC,  this.optionTextD];
    this.bgs     = [this.optionBgA,    this.optionBgB,
                    this.optionBgC,    this.optionBgD];

    // Wire pinch callbacks after all components have awakened
    this.createEvent('OnStartEvent').bind(() => this.wirePinchButtons());
  }

  private wirePinchButtons(): void {
    this.pinches.forEach((pb, i) => {
      if (pb) {
        pb.onButtonPinched.add(() => this.onOptionPinched(i));
      } else {
        print('[Quiz] optionPinch ' + i + ' not connected in Inspector');
      }
    });

    if (this.replayPinch) {
      this.replayPinch.onButtonPinched.add(() => this.playAudio());
    } else {
      print('[Quiz] replayPinch not connected in Inspector');
    }
  }

  loadWord(word: WordEntry): void {
    this.currentWord = word;
    this.answered    = false;

    this.hindiWordText.text   = word.hindi;
    this.romanizedText.text   = word.romanized;
    this.instructionText.text = 'What does this mean?';

    this.shuffledOptions = this.shuffle([word.english, ...word.distractors]);
    this.correctIndex    = this.shuffledOptions.indexOf(word.english);

    this.texts.forEach((t, i) => { if (t) t.text = this.shuffledOptions[i]; });
    this.bgs.forEach(bg   => this.setBg(bg, this.COL_DEFAULT));
    this.pinches.forEach(pb => { if (pb) pb.enabled = true; });

    this.delay(0.6, () => this.playAudio());
  }

  private playAudio(): void {
    if (!this.currentWord) return;
    this.tts.speak(this.currentWord.id);
  }

  private onOptionPinched(index: number): void {
    if (this.answered || !this.currentWord) return;
    this.answered = true;

    this.pinches.forEach(pb => { if (pb) pb.enabled = false; });

    if (index === this.correctIndex) {
      this.setBg(this.bgs[index], this.COL_CORRECT);
      this.instructionText.text = '✓ Correct!';
      this.levelMgr.onQuizCorrect();
    } else {
      this.setBg(this.bgs[index],             this.COL_WRONG);
      this.setBg(this.bgs[this.correctIndex], this.COL_CORRECT);
      this.instructionText.text = 'Not quite - try again!';
      this.delay(1.8, () => {
        this.answered = false;
        this.bgs.forEach(bg => this.setBg(bg, this.COL_DEFAULT));
        this.pinches.forEach(pb => { if (pb) pb.enabled = true; });
        this.instructionText.text = 'What does this mean?';
        this.playAudio();
      });
      this.levelMgr.onQuizWrong();
    }
  }

  private shuffle(arr: string[]): string[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private setBg(img: Image, colour: vec4): void {
    if (img && img.mainPass) img.mainPass.baseColor = colour;
  }

  private delay(sec: number, fn: () => void): void {
    const ev = this.createEvent('DelayedCallbackEvent');
    ev.bind(fn);
    ev.reset(sec);
  }
}