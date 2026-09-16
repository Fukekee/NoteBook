### Particle System Force Field（粒子系统力场）
配合 Particle System 使用的力场影响器。

- 在空间中定义一个区域，粒子进入该区域后会受到各种力的影响
- 支持的力类型：
    - Linear（线性推力）
    - Turbulence（湍流/扰动，让粒子运动更混乱自然）
    - Rotation（旋转力，让粒子绕中心旋转）
    - Drag（阻力）
    - Vector Field（自定义向量场纹理）
- 使用时需要在 Particle System 的 **External Forces 模块中启用**，并设置影响层级

