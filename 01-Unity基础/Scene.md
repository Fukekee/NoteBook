[[unload scene]]
[[remove scene]]
## 场景右键菜单中的两项操作对比

| 操作               | 作用              | 是否卸载内存     | 是否销毁对象 | 是否从项目中删除 | 是否保存修改   |
| ---------------- | --------------- | ---------- | ------ | -------- | -------- |
| **Unload Scene** | 卸载该场景的内容（内存中移除） | ✅ 是        | ✅ 是    | ❌ 否      | ✅（会提示保存） |
| **Remove Scene** | 从编辑器的场景列表中移除引用  | ❌ 否（仍在内存中） | ❌ 否    | ❌ 否      | ✅（会提示保存） |
## Scene 状态变化对比表

|操作|场景是否还在内存中|场景对象是否销毁|SceneManager 是否仍追踪|项目文件是否删除|
|---|---|---|---|---|
|`LoadScene` (Single)|✅ 是|❌ 否|✅ 是|❌ 否|
|`LoadScene` (Additive)|✅ 是|❌ 否|✅ 是|❌ 否|
|`UnloadSceneAsync`|❌ 否|✅ 是|❌ 否|❌ 否|
## 基本概念：Scene 的加载方式

Unity 的场景可以通过两种方式加载：

1. **单场景模式（Single）**
    
    `SceneManager.LoadScene("MainScene", LoadSceneMode.Single);`
    
    - 会先卸载当前所有已加载的场景；
        
    - 然后加载新的场景；
        
    - 新场景成为 **Active Scene（活动场景）**。
        
2. **多场景模式（Additive）**
    
    `SceneManager.LoadScene("SubScene", LoadSceneMode.Additive);`
    
    - 新场景会**叠加加载**到当前环境中；
        
    - 不会自动卸载其他场景；
        
    - 可以同时存在多个场景。