**`-=`** 是一个**复合赋值运算符**
`m_CurrentHealth -= amount * (1 - m_ShieldValue);`
|  相当于
`m_CurrentHealth = m_CurrentHealth - (amount * (1 - m_ShieldValue));`
### 单例模式 (Singleton) - 游戏管理器
### MonoBehaviour 生命周期函数 - 玩家移动
- **生命周期函数**：
    `Awake` -> `Start` -> `Update`/`FixedUpdate` -> `OnCollisionEnter`。
    Unity自动按顺序调用，理解它们的顺序和用途至关重要。
- **`Update` vs `FixedUpdate`**：
    
    - `Update`：与帧率相关。帧率高调用次数多，帧率低调用次数少。适合处理**输入**、即时动画、非物理逻辑。
        
    - `FixedUpdate`：与帧率无关，固定时间步长调用。**物理计算（如`Rigidbody`操作）必须放在这里**，才能保证稳定性。
     
- **`Time.deltaTime`**：**“上一帧耗时”**。让移动速度`moveSpeed`与帧率解耦。无论帧率是30还是60，`* Time.deltaTime`都能保证物体一秒移动`moveSpeed`米。