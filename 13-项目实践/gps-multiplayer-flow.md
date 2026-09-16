# Arena GPS Multiplayer Flow

This document summarizes how the `character-anera` prefab travels from spawn to GPS-driven movement in multiplayer (Fusion) sessions. Use it as a reference when debugging placement, movement, or camera issues.

## High-Level Timeline

1. **Spawn (server/host)** – `PlayerSpawner.EnsureSpawn()` instantiates the player prefab at a spawn point and assigns state/input authority.
2. **Initial placement (optional GPS snap)** – `PlayerGeoSpawn` can RPC the state authority to relocate the player Transform to the real-world GPS coordinate retrieved from `Input.location`.
3. **Per-player setup** – `PlayerSetup.RPC_InitOnAll()` runs on every peer, wiring Mapbox references, creating a GPS target Transform, and binding it to `CharacterMovement`.
4. **Live GPS updates** – `GpsTargetRouter` (bound in `PlayerSetup`) continuously updates the target Transform’s position from GPS deltas.
5. **Character movement** – `CharacterMovement` waits for Mapbox readiness, then drives the avatar toward the target each `LateUpdate`, synchronizing with Fusion’s `NetworkTransform`.
6. **Camera follow (local players only)** – `PlayerCameraBinder` (and a minimal hook in `PlayerController`) retargets `SnapPositionToPosition` so the local camera rig tracks the player.

## Player Placement

- **`PlayerSpawner` (`Assets/Scripts/PlayerConnect/Player/PlayerSpawner.cs`)**
  - Chooses a spawn point (random from `spawnPoints`, or small random offset) and passes it to `Runner.Spawn`.
  - The spawned object already contains a `NetworkObject`, `NetworkTransform`, `CharacterMovement`, `PlayerSetup`, etc.

- **`PlayerGeoSpawn` (`Assets/Scripts/PlayerConnect/Player/PlayerGeoSpawn.cs`)**
  - Runs only on the peer with `InputAuthority`.
  - Starts `Input.location`, waits for an accuracy under `minAccuracyMeters`, then RPCs `RPC_RequestPlaceAtGeo(lat, lon)` to the state authority.
  - The RPC converts GPS lat/lon to world coordinates via the injected `IGeoMapProvider` and directly sets `transform.position`.  
    Use this if arena spawning must match the device’s GPS; otherwise remove/disable it to keep the arena spawn point.

## Target/Map Initialization (`PlayerSetup`)

- `PlayerSetup.RPC_InitOnAll(mapName, targetName)` runs on every peer:
  - Finds or instantiates the `MapBehaviourCore`.
  - Locates an explicit target Transform or creates `Target_{InputAuthority}` at the origin.
  - When the local peer owns the object (`HasInputAuthority`), it finds `GpsTargetRouter` and binds the brand-new target so GPS updates drive that Transform.
  - Binds `CharacterMovement` fields (`MapBehaviour`, `Target`, `CharacterAnimator`) via reflection or an `Init` method and finally calls `movement.ManualInitialize(map)` so the script can react even if the map was already initialized.

## Character Movement (`CharacterMovement`)

- Located at `Assets/Samples/Mapbox Unity SDK/3.0.4/LocationBasedGame/CharacterVisuals/Astronaut/CharacterMovement.cs`.
- Key behaviors:
  - **Initialization guard** – Subscribes to `MapBehaviour.Initialized`, logs readiness, and exposes `ManualInitialize` so `PlayerSetup` can poke it.
  - **Authority check** – Only the peer with `HasStateAuthority` runs movement logic; other peers wait for network replication.
  - **Origin safety** – During `Awake`/`Start`, if the target sits at `(0,0,0)`, the character is also forced to the origin to avoid spurious deltas.
  - **LateUpdate movement** – The GPS chase now runs in `LateUpdate()` (not `Update()`) so it executes after Fusion’s `NetworkRunner.RenderInternal()` step; this prevents `NetworkTransform.Render()` from snapping the object back before the frame ends.
  - **Network sync** – After translating toward the target, it calls `_networkTransform.Teleport(newPos, transform.rotation)` (only when the position actually changed and this peer has authority). This pushes the new TRSP data into Fusion immediately so remote peers see the GPS move without waiting for another physics tick.
  - **Animator flag** – Toggles `CharacterAnimator.SetBool("IsWalking", bool)` depending on whether the target distance exceeds `threshold = 1 / _scale`.
  - **Terrain snapping (optional)** – If `SnapToTerrain` is enabled, it queries Mapbox elevation and locks the `y` value accordingly.

## Camera Follow

- **`PlayerCameraBinder` (`Assets/Scripts/PlayerConnect/Player/PlayerCameraBinder.cs`)**
  - Runs `Spawned()` only on the peer with `HasInputAuthority`.
  - Finds `SnapPositionToPosition` (usually on `CameraRoot`) and points it at the player Transform so the local camera rig tracks GPS motion.

- **`PlayerController` (`Assets/Scripts/PlayerConnect/Player/PlayerController.cs`)**
  - Its `FixedUpdateNetwork()` ignores movement unless actual WASD input exists, ensuring GPS-driven motion from `CharacterMovement` dominates.
  - During `Spawned()` it optionally repositions the main camera (`Camera.main`) to the `camFollowTarget`, complementing `PlayerCameraBinder`.

## Networking Notes

- `character-anera` keeps `NetworkObject`, `NetworkTransform`, and `NetworkMecanimAnimator`.
- GPS motion must occur on the state authority peer; for shared mode the host typically owns every player avatar, so the host is the only machine running `CharacterMovement`.
- Remote peers rely on `NetworkTransform` for interpolation; keeping movement in `LateUpdate` + calling `Teleport()` ensures those replicas receive clean TRSP state.

## Checklist for Debugging

- **No movement?** Ensure `CharacterMovement` has authority, `_readyForUpdates` is true, and `Target` isn’t null.
- **Teleport back / rubber banding?** Confirm movement is still in `LateUpdate` and `_networkTransform.Teleport` fires (logs show “Moving: from … to …”).
- **Wrong initial placement?** Check whether `PlayerGeoSpawn` overrode the arena spawn point or whether `Target` was spawned away from the intended origin.
- **Camera not following?** Verify `PlayerCameraBinder` found a `SnapPositionToPosition` on the local client and that `cameraRootName` matches the hierarchy.

