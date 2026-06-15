// GhostController.ts
// Place on: BooGhost SceneObject
//
// NO required @inputs.
// Animator removed - 3D model only for now.
// Material tinting gives visual state feedback if a material is found.
// All state changes also print to console for debugging.

export type GhostState =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'confused'
  | 'listening'
  | 'celebrate';

@component
export class GhostController extends BaseScriptComponent {

  private ghostMat: Material | null = null;
  private currentState: GhostState = 'idle';

  private readonly TINTS: Record<GhostState, vec4> = {
    idle:      new vec4(0.20, 0.80, 0.30, 1.0), // green
    happy:     new vec4(0.95, 0.90, 0.10, 1.0), // yellow
    sad:       new vec4(0.30, 0.30, 0.80, 1.0), // blue
    confused:  new vec4(0.85, 0.50, 0.10, 1.0), // orange
    listening: new vec4(0.10, 0.90, 0.90, 1.0), // cyan
    celebrate: new vec4(1.00, 0.40, 0.80, 1.0)  // pink
  };

  onAwake(): void {
    // Fix: use this.sceneObject.getComponent, not this.getComponent
    const mesh = this.sceneObject.getComponent('RenderMeshVisual') as RenderMeshVisual;
    if (mesh && mesh.mainMaterial) {
      this.ghostMat = mesh.mainMaterial;
      print('[Ghost] Material found - tinting enabled');
    } else {
      print('[Ghost] No material found - state changes print only');
    }

    this.setState('idle');
  }

  setState(state: GhostState): void {
    this.currentState = state;
    print('[Ghost] → ' + state);

    if (this.ghostMat && this.ghostMat.mainPass) {
      try {
        this.ghostMat.mainPass.baseColor = this.TINTS[state];
      } catch (_) {
        print('[Ghost] Could not tint material');
      }
    }
  }

  getState(): GhostState {
    return this.currentState;
  }
}