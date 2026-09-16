==Trigger和collision==
#### 共同前提

- 双方都必须有 Collider（且启用）。
- 碰撞由 Unity 物理系统判定，所以碰撞双方至少要有一方进入物理系统 → **至少一方挂 Rigidbody**。
- 物理判定永远是**两两进行**的；三个及以上物体之间的相互碰撞，相当于多对两两判定。
- 脚本挂在哪个物体上，哪个物体就会收到对应的回调。

#### OnTriggerEnter（触发事件）

|条件|要求|
|---|---|
|Collider 的 isTrigger|至少一方勾选 isTrigger|
|Rigidbody|至少一方挂 Rigidbody（kinematic 或 non-kinematic 均可）|
|物理模拟|不做物理响应，只做"穿过/进入"的检测|

> 典型用法：触发区域 = `Trigger Collider + Kinematic Rigidbody`，让玩家走进去触发剧情/收集等。

#### OnCollisionEnter（碰撞事件）

|条件|要求|
|---|---|
|Collider 的 isTrigger|双方都不能勾选 isTrigger|
|Rigidbody|至少一方是 non-kinematic Rigidbody；另一方可以无 Rigidbody，也可以是 kinematic/non-kinematic Rigidbody|
|物理模拟|会做真实物理响应（反弹、推动、摩擦等）|

> 反例（不会触发 OnCollisionEnter）：
> 
> - 双方都是 Static Collider（都没刚体）
> - 双方都是 Kinematic Rigidbody
> - 任一方勾了 isTrigger（这种情况只会走 OnTrigger）

#### 速查表（关键判断顺序）

1. 先看 isTrigger：
    - 任一方为 Trigger → 走 `OnTrigger*`
    - 双方都不是 Trigger → 走 `OnCollision*`
2. 再看 Rigidbody：
    - Trigger 路径：至少一方有 Rigidbody（kinematic 即可）
    - Collision 路径：至少一方是 non-kinematic Rigidbody
3. 任一条件不满足 → 不触发任何事件。

### Trigger（触发器）

两个物体的 Collider 至少有一个勾选 Is Trigger，触发以下回调：

private void OnTriggerEnter(Collider other) { /* 进入时 */ }

private void OnTriggerStay(Collider other) { /* 停留每帧 */ }

private void OnTriggerExit(Collider other) { /* 离开时 */ }

应用场景：

- 触摸感应（你的 `BambooKnife` 检测竹子就是这种）
- 拾取物品（玩家走过去自动捡起金币）
- 范围检测（敌人进入塔的攻击范围）

### Collision（实体碰撞）

两个 Collider 都不勾选 Is Trigger，且至少一方有 Rigidbody，触发：

private void OnCollisionEnter(Collision col) { /* 撞上时 */ }

private void OnCollisionStay(Collision col) { /* 接触时 */ }

private void OnCollisionExit(Collision col) { /* 分离时 */ }

应用场景：

- 子弹打中目标
- 物理弹球的反弹
- 角色掉到地面