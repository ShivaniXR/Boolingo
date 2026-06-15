export type GhostState =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'confused'
  | 'listening'
  | 'celebrate';

@component
export class GhostController extends BaseScriptComponent {

  // Wire in Inspector: AnimationMixer component on BooGhost
  // Clip names in your GLTF must match the strings below
  @input animMixer: AnimationMixer;

  // Wire in Inspector: the main material on BooGhost mesh
  // Used for colour tinting while GLTF is a placeholder
  @input ghostMaterial: Material;

  private currentState: GhostState = 'idle';

  // These clip names must match the animation tracks in your imported GLTF
  private readonly CLIPS: Record<GhostState, string> = {
    idle:      'ghost_idle',
    happy:     'ghost_happy',
    sad:       'ghost_sad',
    confused:  'ghost_confused',
    listening: 'ghost_listen',
    celebrate: 'ghost_celebrate'
  };

  // Placeholder tints until real animations are wired
  private readonly TINTS: Record<GhostState, vec4> = {
    idle:      new vec4(0.20, 0.80, 0.30, 1.0), // green
    happy:     new vec4(0.95, 0.90, 0.10, 1.0), // yellow
    sad:       new vec4(0.30, 0.30, 0.80, 1.0), // blue
    confused:  new vec4(0.85, 0.50, 0.10, 1.0), // orange
    listening: new vec4(0.10, 0.90, 0.90, 1.0), // cyan
    celebrate: new vec4(1.00, 0.40, 0.80, 1.0)  // pink
  };

  onAwake() {
    this.setState('idle');
  }

  setState(state: GhostState): void {
    if (this.currentState === state) return;
    this.currentState = state;

    // Play animation clip if mixer is wired
    if (this.animMixer) {
      try {
        // start(layerName, offset, loops) - -1 loops indefinitely
        this.animMixer.start(this.CLIPS[state], 0, -1);
      } catch {
        print('[GhostController] Missing clip: ' + this.CLIPS[state]);
      }
    }

    // Colour tint on material (placeholder)
    if (this.ghostMaterial) {
      this.ghostMaterial.mainPass.baseColor = this.TINTS[state];
    }
  }

  getState(): GhostState {
    return this.currentState;
  }
}