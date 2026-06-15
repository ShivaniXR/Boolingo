// HindiTTS.ts
// Place on: AudioManager SceneObject
//
// INSPECTOR CONNECTIONS (8 AudioComponents on AudioManager):
//   audioNamaste    → AudioComponent playing namaste.mp3
//   audioDhanyavaad → AudioComponent playing dhanyavaad.mp3
//   audioAlvida     → AudioComponent playing alvida.mp3
//   audioKripaya    → AudioComponent playing kripaya.mp3
//   audioMaaf       → AudioComponent playing maaf.mp3
//   audioHaan       → AudioComponent playing haan.mp3
//   audioNahin      → AudioComponent playing nahin.mp3
//   audioSuprabhat  → AudioComponent playing suprabhat.mp3

@component
export class HindiTTS extends BaseScriptComponent {

  @input audioNamaste: AudioComponent;
  @input audioDhanyavaad: AudioComponent;
  @input audioAlvida: AudioComponent;
  @input audioKripaya: AudioComponent;
  @input audioMaaf: AudioComponent;
  @input audioHaan: AudioComponent;
  @input audioNahin: AudioComponent;
  @input audioSuprabhat: AudioComponent;

  private audioMap: { [key: string]: AudioComponent } = {};

  onAwake(): void {
    this.audioMap = {
      namaste:    this.audioNamaste,
      dhanyavaad: this.audioDhanyavaad,
      alvida:     this.audioAlvida,
      kripaya:    this.audioKripaya,
      maaf:       this.audioMaaf,
      haan:       this.audioHaan,
      nahin:      this.audioNahin,
      suprabhat:  this.audioSuprabhat
    };

    // LowLatency so audio fires immediately on correct/wrong
    Object.values(this.audioMap).forEach(ac => {
      if (ac) ac.playbackMode = Audio.PlaybackMode.LowLatency;
    });
  }

  // wordId must match the id field in VocabularyData.ts
  speak(wordId: string): void {
    const ac = this.audioMap[wordId];
    if (!ac) {
      print('[HindiTTS] No AudioComponent for wordId: ' + wordId);
      return;
    }
    ac.play(1);
  }
}