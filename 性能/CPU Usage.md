| 视图        | 形式           | 适合看什么                   |
| --------- | ------------ | ----------------------- |
| Hierarchy | 树状列表 + 数字    | 谁最耗时、Self/Total Time 排序 |
| Timeline  | 横向时间条 + 线程分行 | 时间先后、调用嵌套、多线程并行/等待      |
Timeline ≈ 把 Hierarchy 的调用关系画成「甘特图」，并加上 Main Thread / Render Thread / Worker 等线程。

## `PlayerLoop` 是什么意思？
`PlayerLoop` = Unity 一帧的主循环，几乎整帧所有事都在它里面：

PlayerLoop

├─ Update / FixedUpdate / LateUpdate …

├─ 脚本回调（UIManager等）

├─ 渲染准备、相机、UI

└─ 其它引擎系统
**① 同一条线程里：上下 = 调用栈嵌套（父 → 子）**
规则：
- 上面/外层 = 谁 调用 了下面
- 下面/内层 = 在父函数 执行期间 跑的内容
- 横条越长 = 耗时越多
**② 不同行（Main / Render / Worker）： 不同[^1]线程并行**[^2]
## Render Thread
**Render Thread（渲染线程）** 是 Unity 里专门负责 把「这一帧要画什么」变成 GPU 能执行的绘制命令并提交出去 的一条工作线。

Main Thread（主线程）

    游戏逻辑、Update、LateUpdate
    
    相机、剔除（Cull）、排序、合批
    
    准备渲染数据：「画谁、用什么材质、什么矩阵」

↓      把命令交给渲染线程 / 驱动

Render Thread（渲染线程）

    组装图形 API 调用（Vulkan / D3D / Metal…）

    SetPass、绑定纹理/Buffer、发 Draw Call

↓

GPU

    真正算顶点、像素

有关Render Thread ,Profiler Timeline 里可能看到类似名字：

|名称|含义|
|---|---|
|RenderLoop|本帧渲染循环：走 URP/Built-in 管线，提交各 Pass|
|Gfx.WaitForGfxCommandsFromMainThread|渲染线程 在等主线程 把下一批命令准备好|
|Semaphore.WaitForSignal|线程同步：等信号，说明在 等|
|Present / SwapBuffers|把画好的帧送到显示器|
## Job System
Job 相关的多线程（Unity Job System + 可选 Burst）是：把 一大块纯计算 从 Main Thread 拆到 Worker 线程池 上 并行算，算完再回主线程用结果。
### 典型用在哪

适合 数据多、计算规则简单、不碰 Unity API 的任务：

| 场景              | 例子                                                         |
| --------------- | ---------------------------------------------------------- |
| 大量单位            | 群体寻路预处理、自定义碰撞检测                                            |
| 网格 / 地形         | 顶点动画、LOD 计算                                                |
| 物理相关            | Unity Physics 内部 也用 Job（你 Timeline 里 simulate 可能用到 Worker） |
| 粒子 / VFX        | 大量粒子位置更新                                                   |
| DOTS / Entities | 大规模实体系统 heavily 依赖 Job + Burst                             |
**日常 MonoBehaviour 开发 多数不用 Job；只有 主线程算不过来、且是纯计算 时才值得上。**

**使用前的考虑：**
☐ 主线程 Profiler 里某段「纯循环计算」很重（不是 UI、不是 Instantiate）

☐ 数据量很大（成千上万）

☐ 能写成不碰 Transform/API 的 struct Job

☐ 愿意用 NativeArray / unsafe 一点的数据结构

→ 才考虑 Job + Burst

否则 → 先优化 Main Thread 逻辑、对象池、少在 LateUpdate 里做重活

[^1]:  程序里可以同时推进的多条执行线

[^2]: 现在主流手机都是多核，Unity 的多线程（Render Thread、Job Worker）可以跑在这些核上
