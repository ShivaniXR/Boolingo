// PracticeController.ts
// Place on: PracticePanel SceneObject
//
// INSPECTOR CONNECTIONS:
//   instructionText    → Text "Say it in Hindi!"
//   englishPromptText  → Text showing the English word (large)
//   listeningStatusText→ Text showing mic status
//   feedbackText       → Text showing transcript / result
//   hintText           → Text showing Hindi + Romanized (starts disabled)
//
//   hintPinch  → PinchButton component on HintButton SceneObject
//   skipPinch  → PinchButton component on SkipButton SceneObject
//
//   ttsScriptObj    → AudioManager SceneObject (has HindiTTS script)
//   levelManagerObj → LevelManager SceneObject

import { PinchButton } from 'SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton';
import { WordEntry } from './VocabularyData';

@component
export class PracticeController extends BaseScriptComponent {

  @input instructionText: Text;
  @input englishPromptText: Text;
  @input listeningStatusText: Text;
  @input feedbackText: Text;
  @input hintText: Text;

  @input hintPinch: PinchButton;
  @input skipPinch: PinchButton;

  @input ttsScriptObj: SceneObject;
  @input levelManagerObj: SceneObject;

  private asrModule: any;
  private tts: any;
  private levelMgr: any;
  private currentWord: WordEntry | null = null;
  private isListening: boolean = false;
  private wrongAttempts: number = 0;
  private readonly WRONG_BEFORE_HINT = 2;

  onAwake(): void {
    this.asrModule = require('LensStudio:AsrModule');
    this.tts       = this.ttsScriptObj.getComponent('ScriptComponent');
    this.levelMgr  = this.levelManagerObj.getComponent('ScriptComponent');

    this.hintText.enabled = false;

    this.createEvent('OnStartEvent').bind(() => this.wirePinchButtons());
  }

  private wirePinchButtons(): void {
    if (this.hintPinch) {
      this.hintPinch.onButtonPinched.add(() => this.showHint());
    } else {
      print('[Practice] hintPinch not connected in Inspector');
    }

    if (this.skipPinch) {
      this.skipPinch.onButtonPinched.add(() => this.onSkip());
    } else {
      print('[Practice] skipPinch not connected in Inspector');
    }
  }

  loadWord(word: WordEntry): void {
    this.stopListening();

    this.currentWord   = word;
    this.wrongAttempts = 0;

    this.englishPromptText.text   = word.english;
    this.instructionText.text     = 'Say it in Hindi!';
    this.feedbackText.text        = '';
    this.listeningStatusText.text = '🎙 Listening...';
    this.hintText.text            = word.hindi + '  ·  ' + word.romanized;
    this.hintText.enabled         = false;

    this.delay(0.8, () => this.startListening());
  }

  private startListening(): void {
    if (this.isListening) return;
    this.isListening = true;

    const options = AsrModule.AsrTranscriptionOptions.create();
    options.silenceUntilTerminationMs = 1200;
    options.mode = AsrModule.AsrMode.HighAccuracy;

    options.onTranscriptionUpdateEvent.add((evt: any) => {
      if (!this.isListening) return;
      if (evt.isFinal) {
        this.evaluate(evt.text);
      } else if (evt.text && evt.text.length > 0) {
        this.feedbackText.text = evt.text + '...';
      }
    });

    options.onTranscriptionErrorEvent.add((code: any) => {
      print('[Practice] ASR error: ' + code);
      this.listeningStatusText.text = '⚠ Mic issue - speak again';
    });

    this.asrModule.startTranscribing(options);
    this.listeningStatusText.text = '🎙 Listening...';
  }

  private stopListening(): void {
    if (!this.isListening) return;
    this.isListening = false;
    this.asrModule.stopTranscribing().catch((e: any) => {
      print('[Practice] stopTranscribing: ' + e);
    });
  }

  private evaluate(spokenText: string): void {
    if (!this.currentWord || !this.isListening) return;

    const spoken   = spokenText.toLowerCase().trim();
    const roman    = this.currentWord.romanized.toLowerCase();
    const devanag  = this.currentWord.hindi;
    const tokens   = roman.split(' ');
    const tokenHit = tokens.some(tok => spoken.includes(tok));

    const isCorrect = spoken.includes(roman) ||
                      spoken.includes(devanag) ||
                      tokenHit;

    if (isCorrect) {
      this.isListening          = false;
      this.listeningStatusText.text = '';
      this.feedbackText.text        = '✓ Sahi hai! (Correct!)';
      this.stopListening();
      this.levelMgr.onPracticeCorrect();
    } else {
      this.wrongAttempts++;
      this.feedbackText.text = 'I heard: "' + spokenText + '" - try again!';
      if (this.wrongAttempts >= this.WRONG_BEFORE_HINT) {
        this.showHint();
      }
    }
  }

  private showHint(): void {
    this.hintText.enabled = true;
    if (this.currentWord) this.tts.speak(this.currentWord.id);
    this.delay(5.0, () => { this.hintText.enabled = false; });
  }

  private onSkip(): void {
    this.stopListening();
    if (this.currentWord) {
      this.feedbackText.text = this.currentWord.hindi +
                               ' = ' + this.currentWord.romanized;
    }
    this.delay(1.0, () => this.levelMgr.onPracticeSkip());
  }

  private delay(sec: number, fn: () => void): void {
    const ev = this.createEvent('DelayedCallbackEvent');
    ev.bind(fn);
    ev.reset(sec);
  }
}