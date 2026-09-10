#Vuforia 主要是 **基于视觉的定位**（Computer Vision / 空间计算）
#### . 核心原理：计算设备相对于环境的位置和方向

[[Vuforia]] 的核心目标是实现 **AR Tracking**。原理可以分几步：

##### a. 图像/目标识别

- Vuforia 可以识别 **Image Targets、Object Targets、Model Targets、Ground Plane** 等。
    
- 通过摄像头捕获的图像和数据库中的特征匹配，Vuforia 确定 **相机相对于某个物理参考的坐标变换**（Transform）。
    
- 举例：
    
    - 如果你用 Image Target（打印的图片）作为参考，Vuforia 会识别图片并计算相机相对于图片的位置和旋转。
        
    - 如果是 Ground Plane（水平面），Vuforia 会用平面检测算法识别地面。
        

##### b. 空间计算 / Tracking

- Vuforia 利用 **SLAM（Simultaneous Localization and Mapping）或 VIO（Visual-Inertial Odometry）** 技术。
    
- 它通过摄像头 + 加速度计 / 陀螺仪的传感器数据计算：
    
    - 设备在三维空间中的位置
        
    - 设备朝向
        
- 然后将虚拟对象的坐标与相机坐标系结合，实现“物体固定在现实世界某点”的效果。
    

##### c. Anchor / Pose

- Vuforia 会在识别到的点或平面上生成一个 **Anchor（锚点）**。
    
- 虚拟物体的位置是相对 Anchor 定义的，所以即便用户移动手机，物体仍然保持固定。



**Vuforia Ground Plane 的 `PlaneFinderBehaviour.Mode`** 设置为 **Automatic** 和 **Interactive** 的区别：
### **Automatic 模式**

**特点**：

- 模型 **一旦检测到平面就自动放置**，无需用户点击。
### **Interactive 模式**

**特点**：

- 模型 **只有在用户点击屏幕后才放置**。
    
- 常用方法：
    
    - `PositionContentAtPlaneAnchor` / `PositionContentAtMidAirAnchor` 在点击事件中调用。

| automatic&模型单独放置 | interactive&模型单独放置 | auto&模型放置在stage下面 |
| ---------------- | ------------------ | ----------------- |
| 出现模型             | 出现模型&点击无用          | 点击play黑屏          |
用cube测试

| automatic&模型单独放置 | interactive&模型单独放置 | auto&模型放置在stage下面 | inter&模型放置在stage下面 |
| ---------------- | ------------------ | ----------------- | ------------------ |
| 出现模型             | 出现模型&点击无用          | 无模型               | 无模型&点击无用           |
[Vuforia Unity Tutorial - Ground Plane #11](https://www.youtube.com/watch?v=UG94NSwCrGA)成功实现了的案例
最后成功了，跟着这成功案例，加了Google AR Core和AR Foundation，同时用单位cube原点测试效果，发现对比下场景模型过大，可能是之前未能成功观察到模型的原因。
（如果物体的pivot偏移，如何将它的pivot放置于中心——创建一个空物体，把空物体的pivot点放置在你想要物体pivot存在的点）
水平面怎么确定，利用原点的cube做参照，同时切换2d视图）![[Pasted image 20250924092320.png]]

在 AR 项目里，**ARCamera 是整个 AR 世界的根节点**，它的坐标系会实时跟随真实世界设备移动。所以挂在AR camera下的物体会一直固定在画面上

#### Vuforia Ground Plane 放置的背后流程
**环境扫描 & 特征点检测**
- ARCamera 启动后，Vuforia 会扫描摄像头画面，寻找 **平面特征点**（主要是纹理、角落、边缘）。
    
- 这些点用于估算 **地面位置** 和 **平面法线方向**。
当点击屏幕时，会获得平面的坐标和朝向信息，随后建立一个anchorBehaviour，将模型挂在Anchor下，实现模型固定

已经实现了ground plane stage的pviot在模型的底部
Vuforia Ground Plane 的平面检测精度确实会受 **设备硬件和环境条件**影响
摄像头参数、IMU / 运动传感器精度、环境因素
##### **环境因素**
- **光线不足或过亮** → 相机捕捉特征点困难
    
- **纹理稀少的平面**（光滑地板、白墙） → 特征点少，平面检测不稳定
    
- **反光、阴影、重复图案** → 误识别平面高度
Vuforia Ground Plane 的平面检测精度受多因素影响，为了更好的体验，最好加上UI滑块调节模型高度的功能，使玩家能自定义
![[Pasted image 20250924142113.png]]
扫描点击后摄像头默认以这里为中心

物体总结：模型高度易出错；走得远，容易丢失之前的空间记忆点从而模型消失；随机生成的人物会穿模；地下出现灯笼；没阴影，
