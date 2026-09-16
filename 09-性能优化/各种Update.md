## Update
用来处理输入、一般游戏逻辑
调用频率：每渲染帧 1 次（帧率不稳则间隔变）
Time变量：Time.deltaTime
## FixedUpdate：固定物理步

### 干什么

跟 Physics（Rigidbody、CharacterController 部分逻辑、力） 同步的逻辑放这里。

`void FixedUpdate()`
`{`
`rb.AddForce(moveDir * force); // 物理推力的常见写法`
`}`
### 为什么单独一个

物理引擎按 固定小步长 模拟更稳定：

若用 Update + 帧率从 60 掉到 20：

每步位移变大 → 穿墙、抖动

FixedUpdate 始终 0.02s 一步：

物理结果更一致

### 注意

> [!一帧可能执行多次]
> - 一帧里若 `Time.deltaTime` 很大，可能 连续执行多次 FixedUpdate 追赶物理时间

%% 
若某一 渲染帧 用时比 0.02s 长，物理就会说：「欠了几步，这一帧里要多跑几次 FixedUpdate 补上。」  
这就是 追赶（catch-up）。 %%
- 也可能 0 次（极快帧率时）
- 不要 在 FixedUpdate 里读输入（Input 按帧更新，应 Update 读、FixedUpdate 用）

---

##  LateUpdate：本帧逻辑跑完后再跑

### 干什么

等所有 Update 都执行完 再执行，常用于：

|场景|原因|
|---|---|
|相机跟随角色|先让角色 Update 里移动，再移动相机，避免一帧 lag|
|UI 跟着 3D 物体|物体位置定下来后再算 UI 位置|
|骨骼 / Transform 最终对齐|依赖别人 Update 里改过的 Transform|

`void Update()`
`{`
`// 角色移动`
`}`
`void LateUpdate()`
`{`
`// 相机看向最终位置`
`camera.position = target.position + offset;`
`}`


LateUpdate 一定在 Update 之后；FixedUpdate 和 Update 的先后关系由 Unity 物理循环决定，不要假设「Fixed 总在 Update 前/后」—— 同一帧里可能先若干 Fixed，再 Update，或反过来追赶。

